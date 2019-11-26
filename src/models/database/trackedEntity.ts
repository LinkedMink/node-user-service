import { Document, HookNextFunction, SchemaDefinition, SchemaTypes } from "mongoose";

export const trackedEntitySchemaDefinition: SchemaDefinition = {
  createdDate: {
    type: SchemaTypes.Date,
  },
  createdBy: {
    type: SchemaTypes.String,
  },
  modifiedDate: {
    type: SchemaTypes.Date,
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

export function trackedEntityPreValidateFunc(this: any, next: HookNextFunction) {
  const currentDateTime = new Date();
  if (!this.createdDate) {
    this.createdDate = currentDateTime;
  }

  this.modifiedDate = currentDateTime;

  next();
}
