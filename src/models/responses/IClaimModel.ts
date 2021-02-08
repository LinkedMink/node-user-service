import { ITrackedEntityModel } from "./ITrackedEntityModel";

export interface IClaimModel extends ITrackedEntityModel {
  name: string;
  applications: string[];
}
