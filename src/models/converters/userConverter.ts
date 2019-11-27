import { Types } from "mongoose";
import { IUser, IUserClaim } from "../database/user";
import { IUserModel } from "../userModel";
import { IModelConverter, mapTrackedEntity, setUserModifier } from "./modelConverter";

export class UserConverter implements IModelConverter<IUserModel, IUser> {
  public convertToFrontend = (model: IUser): IUserModel => {
    const claimArray: string[] = [];
    model.claims.forEach((claim) => claimArray.push(claim.name));

    let returnModel: IUserModel = {
      id: model.id,
      email: model.email,
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

    returnModel.email = model.email;
    returnModel.claims = claimArray;

    return returnModel;
  }
}
