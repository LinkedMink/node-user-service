import { IdentityType } from "../database/Identity";
import { ITrackedEntityModel } from "./ITrackedEntityModel";

export interface IIdentityModel {
  type: IdentityType;
}

export interface IEmailPasswordIdentityModel extends IIdentityModel {
  email: string;
  password: string;
  isEmailVerified: boolean;
}

export interface IPublicKeyIdentityModel extends IIdentityModel {
  publicKey: string;
  publicKeyHash: string;
}

export interface IUserModel extends ITrackedEntityModel {
  username: string;
  identities: IIdentityModel[];
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationDates?: Date[];
  claims: string[];
}
