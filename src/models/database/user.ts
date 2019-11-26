import { Document, model, Schema, SchemaTypes, Types } from "mongoose";

import { ITrackedEntity, trackedEntityPreSaveFunc, trackedEntitySchemaDefinition } from "./trackedEntity";

export const HASH_COST_FACTOR = 10;

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
  },
  password: {
    type: SchemaTypes.String,
    required: true,
  },
  claims: [userClaimSchema],
});

const userSchema = new Schema(userSchemaDefinition);
userSchema.pre("save", trackedEntityPreSaveFunc);

export interface IUser extends ITrackedEntity {
  email: string;
  password: string;
  claims: Types.Array<IUserClaim>;
}

export const User = model<IUser>("User", userSchema);
