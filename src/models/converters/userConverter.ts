import bcrypt from "bcrypt";

import { Types } from "mongoose";
import { HASH_COST_FACTOR, IUser, IUserClaim } from "../database/user";
import { IUserModel } from "../userModel";
import { IModelConverter } from "./modelConverter";

export class UserConverter implements IModelConverter<IUserModel, IUser> {
  public convertToFrontend = (model: IUser): IUserModel => {
    return {
      email: model.email,
      claims: model.claims.map((claim) => claim.name),
    };
  }

  public convertToBackend = async (model: IUserModel, existing?: IUser | undefined): Promise<IUser> => {
    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: IUser = tempReturnModel;
    returnModel.email = model.email;

    if (model.password) {
      returnModel.password = await bcrypt.hash(model.password, HASH_COST_FACTOR);
    }

    const claimArray = new Types.Array<IUserClaim>();
    const claimObjects = model.claims.forEach((claim) => {
      claimArray.push({ name: claim } as IUserClaim);
    });

    returnModel.claims = claimArray;

    return returnModel;
  }
}
