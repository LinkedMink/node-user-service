import { EditRecordDocument, EditRecordModel, EditRecordType } from "../database/EditRecord.mjs";
import { EditRecordViewModel } from "../responses/EditRecordViewModel.mjs";
import { DocumentMapper } from "./DocumentMapper.mjs";

export class EditRecordMapper implements DocumentMapper<EditRecordViewModel, EditRecordDocument> {
  convertToFrontend = (model: EditRecordDocument): EditRecordViewModel => {
    return {
      createdDate: model.createdDate,
      createdBy: model.createdBy,
      createdByType: model.createdByType,
      modifiedDate: model.modifiedDate,
      modifiedBy: model.modifiedBy,
      modifiedByType: model.modifiedByType,
    };
  };

  convertToBackend = (
    _model: EditRecordViewModel,
    existing?: EditRecordDocument | undefined,
    modifier?: string
  ): EditRecordDocument => {
    const data: Partial<EditRecordDocument> = existing ?? {};
    if (modifier) {
      data.modifiedBy = modifier;
      data.modifiedByType = EditRecordType.UserId;
      if (!existing) {
        data.createdBy = modifier;
        data.createdByType = EditRecordType.UserId;
      }
    }

    const document = existing ? existing.set(data) : new EditRecordModel(data);
    return document;
  };
}

export const editRecordMapper = new EditRecordMapper();
