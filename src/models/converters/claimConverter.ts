import { Types } from "mongoose";
import { IClaimModel } from "../claimModel";
import { IClaim } from "../database/claim";
import { IModelConverter, mapTrackedEntity, setUserModifier } from "./modelConverter";

export class ClaimConverter implements IModelConverter<IClaimModel, IClaim> {
  public convertToFrontend = (model: IClaim): IClaimModel => {
    let returnModel: IClaimModel = {
      id: model.id,
      name: model.name,
      applications: model.applications.map((e) => e),
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  }

  public convertToBackend = (
    model: IClaimModel,
    existing?: IClaim | undefined,
    modifier?: string): IClaim => {

    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: IClaim = tempReturnModel;
    if (modifier) {
      tempReturnModel = setUserModifier(returnModel, modifier);
    }

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach((e) => {
      applicationsArray.push(e);
    });

    returnModel.name = model.name;
    returnModel.applications = applicationsArray;

    return returnModel;
  }
}
