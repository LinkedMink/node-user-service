import { Document } from "mongoose";
import { ITrackedEntity } from "../database/TrackedEntity";
import { ITrackedEntityModel } from "../ITrackedEntityModel";

export const setUserModifier = <TEntity extends ITrackedEntity>(entity: ITrackedEntity, modifier: string): TEntity => {
  if (!entity.id || !entity.createdBy) {
    entity.createdBy = modifier;
  }

  entity.modifiedBy = modifier;
  return entity as TEntity;
};

export const mapTrackedEntity = <TFrontend extends ITrackedEntityModel>(
  entity: ITrackedEntity,
  toMap: TFrontend): TFrontend => {

  toMap.id = entity.id;
  toMap.createdBy = entity.createdBy;
  toMap.createdDate = entity.createdDate;
  toMap.modifiedBy = entity.modifiedBy;
  toMap.modifiedDate = entity.modifiedDate;

  return toMap;
};

export interface IModelConverter<TFrontend extends object, TBackend extends Document> {
  convertToFrontend(model: TBackend): TFrontend;
  convertToBackend(model: TFrontend, existing?: TBackend, modifier?: string): TBackend;
}
