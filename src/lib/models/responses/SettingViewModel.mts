import { UserEntityViewModel } from "./UserEntityViewModel.mjs";

export interface SettingViewModel extends UserEntityViewModel {
  name: string;
  applications: string[];
  data: unknown;
}
