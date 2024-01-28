import { EditRecordViewModel } from "./EditRecordViewModel.mjs";

export interface ClaimViewModel {
  id: string;
  name: string;
  applications: string[];
  edited: EditRecordViewModel;
}
