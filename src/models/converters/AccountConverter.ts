import { IUser } from "../database/User";
import { IAccountModel } from "../requests/IAccountModel";
import { IModelConverter, setUserModifier } from "./IModelConverter";

export class AccountConverter implements IModelConverter<IAccountModel, IUser> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: IUser = tempReturnModel;
    if (modifier) {
      tempReturnModel = setUserModifier(returnModel, modifier);
    }

    if (model.email) {
      returnModel.email = model.email;
    }

    if (model.password) {
      returnModel.password = model.password;
    }

    return returnModel;
  };
}

export const accountConverter = new AccountConverter();
