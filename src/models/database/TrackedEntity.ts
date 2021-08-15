import { Document, HookNextFunction, ObjectId, SchemaDefinition, SchemaTypes } from "mongoose";

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

export interface ITrackedEntity extends Document<ObjectId> {
  createdDate: Date;
  createdBy: string;
  modifiedDate: Date;
  modifiedBy: string;
}

export function trackedEntityPreValidateFunc(this: ITrackedEntity, next: HookNextFunction): void {
  const currentDateTime = new Date();
  if (this.isNew) {
    this.createdDate = currentDateTime;
  }

  this.modifiedDate = currentDateTime;

  next();
}
