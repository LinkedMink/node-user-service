import { Model, Types } from "mongoose";
import { Claim, IClaim } from "../database/Claim";
import { IClaimModel } from "../responses/IClaimModel";
import { IModelMapper, mapTrackedEntity, setUserModifier } from "./IModelMapper";

export class ClaimMapper implements IModelMapper<IClaimModel, IClaim> {
  constructor(private readonly dbModel: Model<IClaim>) {}

  public convertToFrontend = (model: IClaim): IClaimModel => {
    let returnModel: IClaimModel = {
      name: model.name,
      applications: model.applications.map(e => e),
    };

    returnModel = mapTrackedEntity(model, returnModel);

    return returnModel;
  };

  public convertToBackend = (
    model: IClaimModel,
    existing?: IClaim | undefined,
    modifier?: string
  ): IClaim => {
    let returnModel: Partial<IClaim> = existing ?? {};

    if (modifier) {
      returnModel = setUserModifier(returnModel, modifier);
    }

    const applicationsArray = new Types.Array<string>();
    model.applications.forEach(e => {
      applicationsArray.push(e);
    });

    returnModel.name = model.name;
    returnModel.applications = applicationsArray;

    return new this.dbModel(returnModel);
  };
}

export const claimMapper = new ClaimMapper(Claim);
