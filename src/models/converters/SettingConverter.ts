import { Types } from "mongoose";
import { ISetting } from "../database/Setting";
import { ISettingModel } from "../ISettingModel";
import { IModelConverter, mapTrackedEntity, setUserModifier } from "./IModelConverter";

export class SettingConverter implements IModelConverter<ISettingModel, ISetting> {
  public convertToFrontend = (model: ISetting): ISettingModel => {
    let returnModel: ISettingModel = {
      userId: model.userId.toHexString(),
      name: model.name,
      applications: model.applications.map((e) => e),
      data: model.data,
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  }

  public convertToBackend = (
    model: ISettingModel,
    existing?: ISetting | undefined,
    modifier?: string): ISetting => {

    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: ISetting = tempReturnModel;
    if (modifier) {
      tempReturnModel = setUserModifier(returnModel, modifier);
    }

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach((e) => {
      applicationsArray.push(e);
    });

    returnModel.userId = new Types.ObjectId(model.userId);
    returnModel.name = model.name;
    returnModel.applications = applicationsArray;
    returnModel.data = model.data;

    return returnModel;
  }
}

export const settingConverter = new SettingConverter();
