import { SchemaTypes, Types } from "mongoose";

import { ITrackedEntity, trackedEntitySchemaDefinition } from "./TrackedEntity";
import { User } from "./User";

export const userEntitySchemaDefinition = Object.assign({}, trackedEntitySchemaDefinition, {
  userId: {
    type: SchemaTypes.ObjectId,
    ref: User.modelName,
    index: true,
    required: true,
  },
});

export interface IUserEntity extends ITrackedEntity {
  userId: Types.ObjectId;
}
