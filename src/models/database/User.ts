import bcrypt from "bcrypt";
import { model, Schema, SchemaTypes, Types } from "mongoose";

import { config, ConfigKey } from "../../infastructure/Config";
import { validateEmail } from "../../infastructure/Validators";
import { ITrackedEntity, trackedEntityPreValidateFunc, trackedEntitySchemaDefinition } from "./TrackedEntity";

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
  email: {
    type: SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
    validate: [validateEmail, "Must be a valid email"],
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
  temporaryKey: {
    type: SchemaTypes.String,
  },
  temporaryKeyDate: {
    type: SchemaTypes.Date,
  },
  authenticationDates: [SchemaTypes.Date],
  // TODO validate claims exist, include ID to reference
  claims: [userClaimSchema],
});

const userSchema = new Schema(userSchemaDefinition);
userSchema.pre("validate", trackedEntityPreValidateFunc);

userSchema.post("validate", async function(this: IUser) {
  if (this.isNew || this.modifiedPaths().includes("password")) {
    this.password = await bcrypt.hash(
      this.password,
      config.getNumber(ConfigKey.UserPassHashCostFactor));
  }

  if (this.modifiedPaths().includes("email")) {
    this.isEmailVerified = false;
  }

  if (!this.isLocked && this.modifiedPaths().includes("isLocked")) {
    this.authenticationAttempts = undefined;
    this.isLockedDate = undefined;
  }
});

export interface IUser extends ITrackedEntity {
  email: string;
  password: string;
  isEmailVerified: boolean;
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationAttempts?: number;
  temporaryKey?: string;
  temporaryKeyDate?: Date;
  authenticationDates: Types.Array<Date>;
  claims: Types.Array<IUserClaim>;
}

export const User = model<IUser>("User", userSchema);