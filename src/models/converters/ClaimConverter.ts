import { Types } from "mongoose";
import { IClaim } from "../database/Claim";
import { IClaimModel } from "../IClaimModel";
import { IModelConverter, mapTrackedEntity, setUserModifier } from "./IModelConverter";

export class ClaimConverter implements IModelConverter<IClaimModel, IClaim> {
  public convertToFrontend = (model: IClaim): IClaimModel => {
    let returnModel: IClaimModel = {
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

export const claimConverter = new ClaimConverter();
