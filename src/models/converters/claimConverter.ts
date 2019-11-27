import { Types } from "mongoose";
import { IClaimModel } from "../claimModel";
import { IClaim } from "../database/claim";
import { IModelConverter } from "./modelConverter";

export class ClaimConverter implements IModelConverter<IClaimModel, IClaim> {
  public convertToFrontend = (model: IClaim): IClaimModel => {
    return {
      name: model.name,
      applications: model.applications.map((e) => e),
    };
  }

  public convertToBackend = (model: IClaimModel, existing?: IClaim | undefined): IClaim => {
    let tempReturnModel: any = {};
    if (existing) {
      tempReturnModel = existing;
    }

    const returnModel: IClaim = tempReturnModel;
    returnModel.name = model.name;

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach((e) => {
      applicationsArray.push(e);
    });

    returnModel.applications = applicationsArray;

    return returnModel;
  }
}
