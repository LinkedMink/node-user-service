import { IdentityType } from "../database/Identity.mjs";
import { EditRecordViewModel } from "./EditRecordViewModel.mjs";

export interface IdentityViewModel {
  type: IdentityType;
}

export interface EmailPasswordIdentityViewModel extends IdentityViewModel {
  email: string;
  password: string;
  isEmailVerified: boolean;
}

export interface PublicKeyIdentityViewModel extends IdentityViewModel {
  publicKey: string;
  publicKeyHash: string;
}

export interface UserViewModel {
  id: string;
  username: string;
  identities: IdentityViewModel[];
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationDates?: Date[];
  claims: string[];
  edited: EditRecordViewModel;
}
