import { EditRecordDocument } from "../database/EditRecord.mjs";
import { EmailPasswordIdentity, IdentityType } from "../database/Identity.mjs";
import { UserDocument, UserModel } from "../database/User.mjs";
import { IAccountModel } from "../requests/IAccountModel.mjs";
import { DocumentMapper } from "./DocumentMapper.mjs";
import { editRecordMapper } from "./EditRecordMapper.mjs";

export class AccountMapper implements DocumentMapper<IAccountModel, UserDocument> {
  public convertToFrontend = (model: UserDocument): IAccountModel => {
    return {
      id: model.id as string,
      email: model.username,
    };
  };

  public convertToBackend = (
    model: IAccountModel,
    existing?: UserDocument | undefined,
    modifier?: string
  ): UserDocument => {
    const returnModel: Partial<UserDocument> = existing ?? {};

    if (modifier) {
      returnModel.edited = editRecordMapper.convertToBackend(
        {} as EditRecordDocument,
        existing?.edited,
        modifier
      );
    }

    const identity = returnModel?.identities?.find(
      i => i.type === IdentityType.EmailPassword
    ) as EmailPasswordIdentity;
    if (model.email) {
      returnModel.username = model.email;
      identity.email = model.email;
    }

    if (model.password) {
      identity.password = model.password;
    }

    return new UserModel(returnModel);
  };
}

export const accountMapper = new AccountMapper();
