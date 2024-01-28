import mongoose from "mongoose";
import { MongooseDocument } from "../../types/Mongoose.mjs";
import { UserEntity, userEntitySchemaDefinition } from "./UserEntity.mjs";

export interface Setting extends UserEntity {
  name: string;
  applications: mongoose.Types.Array<string>;
  data: unknown;
}

export type SettingDocument = MongooseDocument<Setting>;

const settingSchema = new mongoose.Schema<Setting>({
  ...userEntitySchemaDefinition,
  name: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  applications: {
    type: [mongoose.SchemaTypes.String],
    index: true,
    required: true,
  },
  data: {
    type: mongoose.SchemaTypes.Mixed,
    required: true,
  },
});
settingSchema.index({ userId: 1, name: 1 }, { unique: true });

export const SettingModel = mongoose.model<Setting>("Setting", settingSchema);
