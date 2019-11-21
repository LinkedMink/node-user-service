import { Document, model, Schema, SchemaTypes } from "mongoose";

import { ITrackedEntity, trackedEntityPreSaveFunc, trackedEntitySchemaDefinition } from "./trackedEntity";

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
});

const userSchema = new Schema(userSchemaDefinition);
userSchema.pre("save", trackedEntityPreSaveFunc);

export interface IUser extends ITrackedEntity {
  email: string;
  password: string;
}

export const User = model<IUser>("User", userSchema);
