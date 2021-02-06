import { Model, Types } from "mongoose";
import { ISetting, Setting } from "../database/Setting";
import { ISettingModel } from "../responses/ISettingModel";
import { IModelMapper, mapTrackedEntity, setUserModifier } from "./IModelMapper";

export class SettingMapper implements IModelMapper<ISettingModel, ISetting> {
  constructor(private readonly dbModel: Model<ISetting>) {}

  public convertToFrontend = (model: ISetting): ISettingModel => {
    let returnModel: ISettingModel = {
      userId: model.userId.toHexString(),
      name: model.name,
      applications: model.applications.map(e => e),
      data: model.data,
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  };

  public convertToBackend = (
    model: ISettingModel,
    existing?: ISetting | undefined,
    modifier?: string
  ): ISetting => {
    let returnModel: Partial<ISetting> = existing ?? {};

    if (modifier) {
      returnModel = setUserModifier(returnModel, modifier);
    }

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach(e => {
      applicationsArray.push(e);
    });

    returnModel.userId = new Types.ObjectId(model.userId);
    returnModel.name = model.name;
    returnModel.applications = applicationsArray;
    returnModel.data = model.data;

    return new this.dbModel(returnModel);
  };
}

export const settingMapper = new SettingMapper(Setting);
