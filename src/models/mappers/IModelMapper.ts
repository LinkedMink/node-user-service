import { Document } from "mongoose";
import { ITrackedEntity } from "../database/TrackedEntity";
import { ITrackedEntityModel } from "../responses/ITrackedEntityModel";

export const setUserModifier = <TEntity extends ITrackedEntity>(
  entity: Partial<ITrackedEntity>,
  modifier: string
): Partial<TEntity> => {
  if (!entity.id || !entity.createdBy) {
    entity.createdBy = modifier;
  }

  entity.modifiedBy = modifier;
  return entity as TEntity;
};

export const mapTrackedEntity = <TFrontend extends ITrackedEntityModel>(
  entity: ITrackedEntity,
  toMap: TFrontend
): TFrontend => {
  toMap.id = entity.id;
  toMap.createdBy = entity.createdBy;
  toMap.createdDate = entity.createdDate;
  toMap.modifiedBy = entity.modifiedBy;
  toMap.modifiedDate = entity.modifiedDate;

  return toMap;
};

export interface IModelMapper<TFrontend, TBackend extends Document<unknown>> {
  convertToFrontend(model: TBackend): TFrontend;
  convertToBackend(model: TFrontend, existing?: TBackend, modifier?: string): TBackend;
}
