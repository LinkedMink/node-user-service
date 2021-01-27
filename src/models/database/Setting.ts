import { model, Schema, SchemaTypes, Types } from "mongoose";

import { trackedEntityPreValidateFunc } from "./TrackedEntity";
import { IUserEntity, userEntitySchemaDefinition } from "./UserEntity";

const schemaDefinition = Object.assign({}, userEntitySchemaDefinition, {
  name: {
    type: SchemaTypes.String,
    required: true,
  },
  applications: {
    type: [SchemaTypes.String],
    index: true,
    required: true,
  },
  data: {
    type: SchemaTypes.Mixed,
    required: true,
  },
});

const settingSchema = new Schema(schemaDefinition);
settingSchema.pre("validate", trackedEntityPreValidateFunc);

settingSchema.index({ userId: 1, name: 1 }, { unique: true });

export interface ISetting extends IUserEntity {
  name: string;
  applications: Types.Array<string>;
  data: unknown;
}

export const Setting = model<ISetting>("Setting", settingSchema);
