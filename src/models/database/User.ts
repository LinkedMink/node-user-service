import { model, Model, Schema, SchemaTypes, Types } from "mongoose";

import {
  emailPasswordSchema,
  identitySchema,
  IdentityType,
  IIdentity,
  publicKeySchema,
} from "./Identity";
import {
  ITrackedEntity,
  trackedEntityPreValidateFunc,
  trackedEntitySchemaDefinition,
} from "./TrackedEntity";

const userClaimSchemaDefinition = {
  name: {
    type: SchemaTypes.String,
    required: true,
  },
};

const userClaimSchema = new Schema(userClaimSchemaDefinition);

export interface IUserClaim extends Types.Subdocument {
  name: string;
}

const userSchemaDefinition = Object.assign({}, trackedEntitySchemaDefinition, {
  username: {
    type: SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
  identities: [identitySchema],
  isLocked: {
    type: SchemaTypes.Boolean,
    required: true,
  },
  isLockedDate: {
    type: SchemaTypes.Date,
  },
  authenticationAttempts: {
    type: SchemaTypes.Number,
  },
  authenticationDates: [SchemaTypes.Date],
  // TODO validate claims exist, include ID to reference
  claims: [userClaimSchema],
});

const userSchema = new Schema(userSchemaDefinition);
const identities = userSchema.path("identities") as unknown as Model<IIdentity>;
identities.discriminator(IdentityType.EmailPassword, emailPasswordSchema);
identities.discriminator(IdentityType.PublicKey, publicKeySchema);

userSchema.pre("validate", trackedEntityPreValidateFunc);

userSchema.post("validate", function (this: IUser) {
  if (!this.isLocked && this.modifiedPaths().includes("isLocked")) {
    this.authenticationAttempts = undefined;
    this.isLockedDate = undefined;
  }
});

export interface IUser extends ITrackedEntity {
  username: string;
  identities: Types.DocumentArray<IIdentity>;
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationAttempts?: number;
  authenticationDates: Types.Array<Date>;
  claims: Types.Array<IUserClaim>;
}

export const User = model<IUser>("User", userSchema);
