import mongoose from "mongoose";
import { config } from "../../infrastructure/Config.mjs";
import { ConfigKey } from "../../infrastructure/ConfigKey.mjs";
import { MongooseDocument } from "../../types/Mongoose.mjs";

export enum EditRecordType {
  UserId = "UserId",
  AppName = "AppName",
}

export interface EditRecord {
  _id?: undefined;
  createdDate: Date;
  createdBy: string;
  createdByType: EditRecordType;
  modifiedDate: Date;
  modifiedBy: string;
  modifiedByType: EditRecordType;
}

export type EditRecordDocument = MongooseDocument<EditRecord, undefined>;

export const editRecordSchema = new mongoose.Schema<EditRecord>(
  {
    createdDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.SchemaTypes.String,
      required: true,
      default: config.getString(ConfigKey.AppName),
    },
    createdByType: {
      type: mongoose.SchemaTypes.String,
      required: true,
      enum: EditRecordType,
      default: EditRecordType.AppName,
    },
    modifiedDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
      default: Date.now,
    },
    modifiedBy: {
      type: mongoose.SchemaTypes.String,
      required: true,
      default: config.getString(ConfigKey.AppName),
    },
    modifiedByType: {
      type: mongoose.SchemaTypes.String,
      required: true,
      enum: EditRecordType,
      default: EditRecordType.AppName,
    },
  },
  { _id: false }
);

editRecordSchema.pre("validate", function editRecordPreValidateFunc(this, next): void {
  if (!this.isNew) {
    this.modifiedDate = new Date();
    this.modifiedBy = this.modifiedBy ?? config.getString(ConfigKey.AppName);
    this.modifiedByType = this.modifiedByType ?? EditRecordType.AppName;
  }

  next();
});

export const EditRecordModel = mongoose.model<EditRecord>("EditRecord", editRecordSchema);
