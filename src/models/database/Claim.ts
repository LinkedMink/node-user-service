import { Document, model, Schema, SchemaTypes, Types } from "mongoose";

import { ITrackedEntity, trackedEntityPreValidateFunc, trackedEntitySchemaDefinition } from "./TrackedEntity";

const claimSchemaDefinition = Object.assign({}, trackedEntitySchemaDefinition, {
  name: {
    type: SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
  applications: {
    type: [SchemaTypes.String],
    required: true,
  },
});

const claimSchema = new Schema(claimSchemaDefinition);
claimSchema.pre("validate", trackedEntityPreValidateFunc);

export interface IClaim extends ITrackedEntity {
  name: string;
  applications: Types.Array<string>;
}

export const Claim = model<IClaim>("Claim", claimSchema);
