import mongoose from "mongoose";
import { EditRecordDocument, editRecordSchema } from "./EditRecord.mjs";
import { UserModel } from "./User.mjs";

export interface UserEntity {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  edited: EditRecordDocument;
}

export const userEntitySchemaDefinition: mongoose.SchemaDefinition = {
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserModel.modelName,
    index: true,
    required: true,
  },
  edited: {
    type: editRecordSchema,
    required: true,
    default: {},
  },
};
