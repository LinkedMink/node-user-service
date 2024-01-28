import { Types } from "mongoose";
import { EditRecordDocument } from "../database/EditRecord.mjs";
import { SettingDocument, SettingModel } from "../database/Setting.mjs";
import { SettingViewModel } from "../responses/SettingViewModel.mjs";
import { DocumentMapper } from "./DocumentMapper.mjs";
import { editRecordMapper } from "./EditRecordMapper.mjs";

export class SettingMapper implements DocumentMapper<SettingViewModel, SettingDocument> {
  public convertToFrontend = (model: SettingDocument): SettingViewModel => {
    const returnModel: SettingViewModel = {
      id: model.id as string,
      userId: model.userId.toHexString(),
      name: model.name,
      applications: model.applications.map(e => e),
      data: model.data,
      edited: editRecordMapper.convertToFrontend(model.edited),
    };

    return returnModel;
  };

  public convertToBackend = (
    model: SettingViewModel,
    existing?: SettingDocument | undefined,
    modifier?: string
  ): SettingDocument => {
    const returnModel: Partial<SettingDocument> = existing ?? {};

    if (modifier) {
      returnModel.edited = editRecordMapper.convertToBackend(
        {} as EditRecordDocument,
        existing?.edited,
        modifier
      );
    }

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach(e => {
      applicationsArray.push(e);
    });

    returnModel.userId = new Types.ObjectId(model.userId);
    returnModel.name = model.name;
    returnModel.applications = applicationsArray;
    returnModel.data = model.data;

    return new SettingModel(returnModel);
  };
}

export const settingMapper = new SettingMapper();
