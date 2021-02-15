import { createCrudRouter, filterByUserId } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization";
import { settingMapper } from "../models/mappers/SettingMapper";
import { Setting } from "../models/database/Setting";
import { Router } from "express";

export const getSettingRouter = (): Router => {
  return createCrudRouter(
    Setting,
    settingMapper,
    AuthorizationClaim.UserSettings,
    AuthorizationClaim.UserSettings,
    authorizeUserOwned,
    filterByUserId
  );
}
