import bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "node:crypto";
import { config } from "../../infrastructure/Config.mjs";
import { ConfigKey } from "../../infrastructure/ConfigKey.mjs";
import { validateEmail } from "../../infrastructure/Validators.mjs";

export enum IdentityType {
  EmailPassword = "EmailPassword",
  ExternalIdProvider = "ExternalIdProvider",
  PublicKey = "PublicKey",
}

export interface Identity {
  _id?: undefined;
  type: IdentityType;
}

export interface EmailPasswordIdentity extends Identity {
  email: string;
  password: string;
  isEmailVerified: boolean;
  temporaryKey?: string;
  temporaryKeyDate?: Date;
}

export interface PublicKeyIdentity extends Identity {
  publicKey: Buffer;
  publicKeyHash: Buffer;
}

export type AnyIdentity = EmailPasswordIdentity | PublicKeyIdentity;

const options = { discriminatorKey: "type", _id: false };
const identitySchemaDefinition = {
  type: {
    type: mongoose.SchemaTypes.String,
    enum: Object.values(IdentityType),
    required: true,
  },
};

export const identitySchema = new mongoose.Schema<Identity>(identitySchemaDefinition, options);
export const IdentityModel = mongoose.model<Identity>("Identity", identitySchema);

export const emailPasswordSchema = new mongoose.Schema<EmailPasswordIdentity>(
  {
    email: {
      type: mongoose.SchemaTypes.String,
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
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: config.getNumber(ConfigKey.UserPassMinLength),
    },
    isEmailVerified: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
    },
    temporaryKey: {
      type: mongoose.SchemaTypes.String,
    },
    temporaryKeyDate: {
      type: mongoose.SchemaTypes.Date,
    },
  },
  options
);

emailPasswordSchema.post("validate", async function (this) {
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

export const publicKeySchema = new mongoose.Schema<PublicKeyIdentity>(
  {
    publicKey: {
      type: mongoose.SchemaTypes.Mixed,
      required: true,
    },
    publicKeyHash: {
      type: mongoose.SchemaTypes.Mixed,
      index: true,
      required: true,
    },
  },
  options
);

publicKeySchema.pre("validate", function (this, next) {
  if (this.isNew || this.modifiedPaths().includes("publicKey")) {
    this.publicKeyHash = crypto.createHash("sha256").update(this.publicKey).digest();
  }

  next();
});
