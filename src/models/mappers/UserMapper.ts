import { Model, Types } from "mongoose";
import { IUser, IUserClaim, User } from "../database/User";
import { IUserModel } from "../responses/IUserModel";
import { IModelMapper, mapTrackedEntity, setUserModifier } from "./IModelMapper";

export class UserMapper implements IModelMapper<IUserModel, IUser> {
  constructor(private readonly dbModel: Model<IUser>) {}

  public convertToFrontend = (model: IUser): IUserModel => {
    const claimArray: string[] = [];
    model.claims.forEach(claim => claimArray.push(claim.name));

    let returnModel: IUserModel = {
      email: model.email,
      isEmailVerified: model.isEmailVerified,
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

    if (model.password) {
      returnModel.password = model.password;
    }

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

    returnModel.email = model.email;
    returnModel.isEmailVerified = model.isEmailVerified;
    returnModel.isLocked = model.isLocked;
    returnModel.claims = claimArray;

    return new this.dbModel(returnModel);
  };
}

export const userMapper = new UserMapper(User);
