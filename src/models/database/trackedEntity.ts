import { Document, HookNextFunction, SchemaDefinition, SchemaTypes } from "mongoose";

export const trackedEntitySchemaDefinition: SchemaDefinition = {
  createdDate: {
    type: SchemaTypes.Date,
    required: true,
  },
  createdBy: {
    type: SchemaTypes.String,
  },
  modifiedDate: {
    type: SchemaTypes.Date,
    required: true,
  },
  modifiedBy: {
    type: SchemaTypes.String,
  },
};

export interface ITrackedEntity extends Document {
  createdDate: Date;
  createdBy: string;
  modifiedDate: Date;
  modifiedBy: string;
}

export function trackedEntityPreSaveFunc(this: any, next: HookNextFunction) {
  const currentDateTime = new Date();
  if (!this.id) {
    this.createdDate = currentDateTime;
  }

  this.modifiedDate = currentDateTime;

  next();
}
