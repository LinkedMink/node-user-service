import { Types } from "mongoose";
import { IUser, IUserClaim } from "../database/User";
import { IUserModel } from "../IUserModel";
import { IModelConverter, mapTrackedEntity, setUserModifier } from "./IModelConverter";

export class UserConverter implements IModelConverter<IUserModel, IUser> {
  public convertToFrontend = (model: IUser): IUserModel => {
    const claimArray: string[] = [];
    model.claims.forEach((claim) => claimArray.push(claim.name));

    let returnModel: IUserModel = {
      id: model.id,
      email: model.email,
      isEmailVerified: model.isEmailVerified,
      isLocked: model.isLocked,
      isLockedDate: model.isLockedDate,
      authenticationDates: model.authenticationDates.map((e) => e),
      claims: claimArray,
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  }

  public convertToBackend = (
    model: IUserModel,
    existing?: IUser | undefined,
    modifier?: string): IUser => {

    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: IUser = tempReturnModel;
    if (modifier) {
      tempReturnModel = setUserModifier(returnModel, modifier);
    }

    if (model.password) {
      returnModel.password = model.password;
    }

    const claimArray = new Types.Array<IUserClaim>();
    model.claims.forEach((claim) => {
      claimArray.push({ name: claim } as IUserClaim);
    });

    const dateArray = new Types.Array<Date>();
    if (model.authenticationDates) {
      model.authenticationDates.forEach((date) => {
        dateArray.push(date);
      });
    }

    returnModel.email = model.email;
    returnModel.isEmailVerified = model.isEmailVerified;
    returnModel.isLocked = model.isLocked;
    returnModel.claims = claimArray;

    return returnModel;
  }
}

export const userConverter = new UserConverter();
