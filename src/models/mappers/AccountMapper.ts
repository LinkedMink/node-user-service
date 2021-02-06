import { Model } from "mongoose";
import { IUser, User } from "../database/User";
import { IAccountModel } from "../requests/IAccountModel";
import { IModelMapper, setUserModifier } from "./IModelMapper";

export class AccountMapper implements IModelMapper<IAccountModel, IUser> {
  constructor(private readonly dbModel: Model<IUser>) {}

  public convertToFrontend = (model: IUser): IAccountModel => {
    return {
      id: model.id,
      email: model.email,
    };
  };

  public convertToBackend = (
    model: IAccountModel,
    existing?: IUser | undefined,
    modifier?: string
  ): IUser => {
    let returnModel: Partial<IUser> = existing ?? {};

    if (modifier) {
      returnModel = setUserModifier(returnModel, modifier);
    }

    if (model.email) {
      returnModel.email = model.email;
    }

    if (model.password) {
      returnModel.password = model.password;
    }

    return new this.dbModel(returnModel);
  };
}

export const accountMapper = new AccountMapper(User);
