import { EditRecordViewModel } from "./EditRecordViewModel.mjs";

export interface UserEntityViewModel {
  id: string;
  userId?: string;
  edited: EditRecordViewModel;
}
