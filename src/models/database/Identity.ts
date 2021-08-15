import bcrypt from "bcrypt";
import crypto from "crypto";
import { HookNextFunction, model, Schema, SchemaTypes, Types } from "mongoose";
import { config } from "../../infastructure/Config";
import { ConfigKey } from "../../infastructure/ConfigKey";
import { validateEmail } from "../../infastructure/Validators";

export enum IdentityType {
  EmailPassword = "EmailPassword",
  PublicKey = "PublicKey",
}

const options = { discriminatorKey: "type", _id: false };
const identitySchemaDefinition = {
  type: {
    type: SchemaTypes.String,
    enum: Object.values(IdentityType),
    required: true,
  },
};

export const identitySchema = new Schema(identitySchemaDefinition, options);

export interface IIdentity extends Types.Subdocument {
  type: IdentityType;
}

export const Identity = model<IIdentity>("Identity", identitySchema);

const emailPasswordSchemaDefinition = {
  email: {
    type: SchemaTypes.String,
    index: true,
    unique: true,
    sparse: true,
    dropDups: true,
    required: true,
    validate: {
      validator: validateEmail,
      message: "Must be a valid email",
    },
  },
  password: {
    type: SchemaTypes.String,
    required: true,
    minlength: config.getNumber(ConfigKey.UserPassMinLength),
  },
  isEmailVerified: {
    type: SchemaTypes.Boolean,
    required: true,
  },
  temporaryKey: {
    type: SchemaTypes.String,
  },
  temporaryKeyDate: {
    type: SchemaTypes.Date,
  },
};

export const emailPasswordSchema = new Schema(emailPasswordSchemaDefinition, options);

// TODO investigate why this works, might save before password set?
// eslint-disable-next-line @typescript-eslint/no-misused-promises
emailPasswordSchema.post("validate", async function (this: IEmailPasswordIdentity) {
  if (this.isNew || this.modifiedPaths().includes("password")) {
    this.password = await bcrypt.hash(
      this.password,
      config.getNumber(ConfigKey.UserPassHashCostFactor)
    );
  }

  if (this.modifiedPaths().includes("email")) {
    this.isEmailVerified = false;
  }
});

export const EmailPasswordIdentity = Identity.discriminator<IEmailPasswordIdentity>(
  IdentityType.EmailPassword,
  new Schema(emailPasswordSchemaDefinition, options)
);

export interface IEmailPasswordIdentity extends IIdentity {
  email: string;
  password: string;
  isEmailVerified: boolean;
  temporaryKey?: string;
  temporaryKeyDate?: Date;
}

export const publicKeySchemaDefinition = {
  publicKey: {
    type: SchemaTypes.Buffer,
    required: true,
  },
  publicKeyHash: {
    type: SchemaTypes.Buffer,
    index: true,
    required: true,
  },
};

export interface IPublicKeyIdentity extends IIdentity {
  publicKey: Buffer;
  publicKeyHash: Buffer;
}

export const publicKeySchema = new Schema(publicKeySchemaDefinition, options);
publicKeySchema.pre("validate", function (this: IPublicKeyIdentity, next: HookNextFunction) {
  if (this.isNew || this.modifiedPaths().includes("publicKey")) {
    this.publicKeyHash = crypto.createHash("sha256").update(this.publicKey).digest();
  }

  next();
});

export const PublicKeyIdentity = Identity.discriminator<IPublicKeyIdentity>(
  IdentityType.PublicKey,
  new Schema(publicKeySchema, options)
);
