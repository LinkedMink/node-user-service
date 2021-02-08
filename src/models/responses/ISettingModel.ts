import { IUserEntityModel } from "./IUserEntityModel";

export interface ISettingModel extends IUserEntityModel {
  name: string;
  applications: string[];
  data: unknown;
}
