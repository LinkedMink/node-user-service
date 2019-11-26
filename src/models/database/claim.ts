import { Document, model, Schema, SchemaTypes, Types } from "mongoose";

import { ITrackedEntity, trackedEntityPreValidateFunc, trackedEntitySchemaDefinition } from "./trackedEntity";

const claimSchemaDefinition = Object.assign({}, trackedEntitySchemaDefinition, {
  name: {
    type: SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
});

const claimSchema = new Schema(claimSchemaDefinition);
claimSchema.pre("validate", trackedEntityPreValidateFunc);

export interface IClaim extends ITrackedEntity {
  name: string;
}

export const User = model<IClaim>("Claim", claimSchema);
