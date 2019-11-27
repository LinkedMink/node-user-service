import bcrypt from "bcrypt";
import { model, Schema, SchemaTypes, Types } from "mongoose";

import { ConfigKey, getConfigValue } from "../../infastructure/config";
import { validateEmail } from "../../infastructure/validators";
import { ITrackedEntity, trackedEntityPreValidateFunc, trackedEntitySchemaDefinition } from "./trackedEntity";

const hashCostFactor = Number(getConfigValue(ConfigKey.UserPassHashCostFactor));

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
    minlength: Number(getConfigValue(ConfigKey.UserPassMinLength)),
  },
  claims: [userClaimSchema],
});

const userSchema = new Schema(userSchemaDefinition);
userSchema.pre("validate", trackedEntityPreValidateFunc);

userSchema.post("validate", async function(this: IUser) {
  if (this.isNew || this.modifiedPaths().includes("password")) {
    this.password = await bcrypt.hash(this.password, hashCostFactor);
  }
});

export interface IUser extends ITrackedEntity {
  email: string;
  password: string;
  claims: Types.Array<IUserClaim>;
}

export const User = model<IUser>("User", userSchema);
