import { Types } from "mongoose";
import { ClaimDocument, ClaimModel } from "../database/Claim.mjs";
import { EditRecordDocument } from "../database/EditRecord.mjs";
import { ClaimViewModel } from "../responses/ClaimViewModel.mjs";
import { DocumentMapper } from "./DocumentMapper.mjs";
import { editRecordMapper } from "./EditRecordMapper.mjs";

export class ClaimMapper implements DocumentMapper<ClaimViewModel, ClaimDocument> {
  public convertToFrontend = (model: ClaimDocument): ClaimViewModel => {
    const returnModel: ClaimViewModel = {
      id: model.id as string,
      name: model.name,
      applications: model.applications.map(e => e),
      edited: editRecordMapper.convertToFrontend(model.edited),
    };

    return returnModel;
  };

  public convertToBackend = (
    model: ClaimViewModel,
    existing?: ClaimDocument | undefined,
    modifier?: string
  ): ClaimDocument => {
    const returnModel: Partial<ClaimDocument> = existing ?? {};

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

    returnModel.name = model.name;
    returnModel.applications = applicationsArray;

    return new ClaimModel(returnModel);
  };
}

export const claimMapper = new ClaimMapper();
