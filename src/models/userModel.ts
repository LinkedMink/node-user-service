import { ITrackedEntityModel } from "./trackedEntityModel";

export interface IUserModel extends ITrackedEntityModel {
  email: string;
  password?: string;
  isEmailVerified: boolean;
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationDates?: Date[];
  claims: string[];
}
