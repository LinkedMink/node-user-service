import { ITrackedEntityModel } from "./trackedEntityModel";

export interface IClaimModel extends ITrackedEntityModel {
  name: string;
  applications: string[];
}
