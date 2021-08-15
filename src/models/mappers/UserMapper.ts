import { Model, Types } from "mongoose";
import {
  IdentityType,
  IEmailPasswordIdentity,
  IIdentity,
  IPublicKeyIdentity,
} from "../database/Identity";
import { IUser, IUserClaim, User } from "../database/User";
import {
  IEmailPasswordIdentityModel,
  IIdentityModel,
  IPublicKeyIdentityModel,
  IUserModel,
} from "../responses/IUserModel";
import { IModelMapper, mapTrackedEntity, setUserModifier } from "./IModelMapper";

function isEmailPasswordId(
  value: IIdentityModel | IIdentity
): value is IEmailPasswordIdentityModel {
  return value.type === IdentityType.EmailPassword;
}

function isPublicKeyId(value: IIdentityModel | IIdentity): value is IPublicKeyIdentityModel {
  return value.type === IdentityType.PublicKey;
}

export class UserMapper implements IModelMapper<IUserModel, IUser> {
  constructor(private readonly dbModel: Model<IUser>) {}

  public convertToFrontend = (model: IUser): IUserModel => {
    const claimArray: string[] = [];
    model.claims.forEach(claim => claimArray.push(claim.name));

    const identities = model.identities.map(i => {
      if (isEmailPasswordId(i)) {
        return {
          type: i.type,
          email: i.email,
          isEmailVerified: i.isEmailVerified,
        } as IIdentityModel;
      } else if (isPublicKeyId(i)) {
        return { type: i.type, publicKey: i.publicKey } as IIdentityModel;
      } else {
        return { type: i.type };
      }
    });

    let returnModel: IUserModel = {
      username: model.username,
      identities,
      isLocked: model.isLocked,
      isLockedDate: model.isLockedDate,
      authenticationDates: model.authenticationDates.map(e => e),
      claims: claimArray,
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  };

  public convertToBackend = (
    model: IUserModel,
    existing?: IUser | undefined,
    modifier?: string
  ): IUser => {
    let returnModel: Partial<IUser> = existing ?? {};

    if (modifier) {
      returnModel = setUserModifier(returnModel, modifier);
    }

    if (!returnModel.identities) {
      returnModel.identities = new Types.DocumentArray([]);
    }

    model.identities.forEach(id => {
      const identity = returnModel.identities?.find(i => i.type === id.type);

      let idResolve = identity;
      if (!identity) {
        idResolve = { type: id.type } as IIdentity;
        returnModel.identities?.push(idResolve);
      }

      if (isEmailPasswordId(id)) {
        const idTyped = idResolve as IEmailPasswordIdentity;
        idTyped.email = id.email;
        idTyped.isEmailVerified = id.isEmailVerified;
        if (id.password) {
          idTyped.password = id.password;
        }
      } else if (isPublicKeyId(id)) {
        const idTyped = idResolve as IPublicKeyIdentity;
        idTyped.publicKey = Buffer.from(id.publicKey, "base64");
      }
    });

    const claimArray = new Types.Array<IUserClaim>();
    model.claims.forEach(claim => {
      claimArray.push({ name: claim } as IUserClaim);
    });

    const dateArray = new Types.Array<Date>();
    if (model.authenticationDates) {
      model.authenticationDates.forEach(date => {
        dateArray.push(date);
      });
    }

    returnModel.username = model.username;
    returnModel.isLocked = model.isLocked;
    returnModel.claims = claimArray;

    return new this.dbModel(returnModel);
  };
}

export const userMapper = new UserMapper(User);
