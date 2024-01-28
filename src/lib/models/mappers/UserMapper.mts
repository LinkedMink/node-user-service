import { Types } from "mongoose";
import { EditRecordDocument } from "../database/EditRecord.mjs";
import {
  AnyIdentity,
  EmailPasswordIdentity,
  Identity,
  IdentityType,
  PublicKeyIdentity,
} from "../database/Identity.mjs";
import { UserClaim, UserDocument, UserModel } from "../database/User.mjs";
import {
  EmailPasswordIdentityViewModel,
  IdentityViewModel,
  PublicKeyIdentityViewModel,
  UserViewModel,
} from "../responses/UserViewModel.mjs";
import { DocumentMapper } from "./DocumentMapper.mjs";
import { editRecordMapper } from "./EditRecordMapper.mjs";

function isEmailPasswordId(
  value: IdentityViewModel | Identity
): value is EmailPasswordIdentityViewModel {
  return value.type === IdentityType.EmailPassword;
}

function isPublicKeyId(value: IdentityViewModel | Identity): value is PublicKeyIdentityViewModel {
  return value.type === IdentityType.PublicKey;
}

export class UserMapper implements DocumentMapper<UserViewModel, UserDocument> {
  public convertToFrontend = (model: UserDocument): UserViewModel => {
    const claimArray: string[] = [];
    model.claims.forEach(claim => claimArray.push(claim.name));

    const identities = model.identities.map(i => {
      if (isEmailPasswordId(i)) {
        return {
          type: i.type,
          email: i.email,
          isEmailVerified: i.isEmailVerified,
        } as IdentityViewModel;
      } else if (isPublicKeyId(i)) {
        return { type: i.type, publicKey: i.publicKey } as IdentityViewModel;
      } else {
        return { type: i.type };
      }
    });

    const returnModel: UserViewModel = {
      id: model.id as string,
      username: model.username,
      identities,
      isLocked: model.isLocked,
      isLockedDate: model.isLockedDate,
      authenticationDates: model.authenticationDates.map(e => e),
      claims: claimArray,
      edited: editRecordMapper.convertToFrontend(model.edited),
    };

    return returnModel;
  };

  public convertToBackend = (
    model: UserViewModel,
    existing?: UserDocument | undefined,
    modifier?: string
  ): UserDocument => {
    const returnModel: Partial<UserDocument> = existing ?? {};

    if (modifier) {
      returnModel.edited = editRecordMapper.convertToBackend(
        {} as EditRecordDocument,
        existing?.edited,
        modifier
      );
    }

    if (!returnModel.identities) {
      returnModel.identities = new Types.DocumentArray([]);
    }

    model.identities.forEach(id => {
      const existingId = returnModel.identities?.find(i => i.type === id.type);

      let modifyId: AnyIdentity | undefined = existingId;
      if (!modifyId) {
        modifyId = { type: id.type } as AnyIdentity;
        returnModel.identities?.push(modifyId);
      }

      if (isEmailPasswordId(id)) {
        const idTyped = modifyId as EmailPasswordIdentity;
        idTyped.email = id.email;
        idTyped.isEmailVerified = id.isEmailVerified;
        if (id.password) {
          idTyped.password = id.password;
        }
      } else if (isPublicKeyId(id)) {
        const idTyped = modifyId as PublicKeyIdentity;
        idTyped.publicKey = Buffer.from(id.publicKey, "base64");
      }
    });

    const claimArray = new Types.DocumentArray<UserClaim>(
      model.claims.map(claim => ({ name: claim }))
    );

    const dateArray = new Types.Array<Date>();
    model.authenticationDates?.forEach(date => {
      dateArray.push(date);
    });
    returnModel.authenticationDates = dateArray;

    returnModel.username = model.username;
    returnModel.isLocked = model.isLocked;
    returnModel.claims = claimArray;

    return new UserModel(returnModel);
  };
}

export const userMapper = new UserMapper();
