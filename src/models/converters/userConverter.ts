import bcrypt from "bcrypt";

import { Types } from "mongoose";
import { ConfigKey, getConfigValue } from "../../infastructure/config";
import { IUser, IUserClaim } from "../database/user";
import { IUserModel } from "../userModel";
import { IModelConverter } from "./modelConverter";

export class UserConverter implements IModelConverter<IUserModel, IUser> {
  private hashCostFactor = Number(getConfigValue(ConfigKey.UserPassHashCostFactor));
  private passMinLength = Number(getConfigValue(ConfigKey.UserPassMinLength));

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
      if (model.password.length < this.passMinLength) {
        throw new Error(`Password minimum length: ${this.passMinLength}`);
      }

      returnModel.password = await bcrypt.hash(model.password, this.hashCostFactor);
    }

    const claimArray = new Types.Array<IUserClaim>();
    model.claims.forEach((claim) => {
      claimArray.push({ name: claim } as IUserClaim);
    });

    returnModel.claims = claimArray;

    return returnModel;
  }
}
