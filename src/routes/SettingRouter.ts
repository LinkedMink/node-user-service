import { createCrudRouter, filterByUserId } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization";
import { settingMapper } from "../models/mappers/SettingMapper";
import { Setting } from "../models/database/Setting";

export const settingRouter = createCrudRouter(
  Setting,
  settingMapper,
  AuthorizationClaim.UserSettings,
  AuthorizationClaim.UserSettings,
  authorizeUserOwned,
  filterByUserId
);
