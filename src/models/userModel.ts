import { ITrackedEntityModel } from "./trackedEntityModel";

export interface IUserModel extends ITrackedEntityModel {
  id?: string;
  email: string;
  password?: string;
  claims: string[];
}
