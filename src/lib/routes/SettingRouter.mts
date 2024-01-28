import { Router } from "express";
import { createCrudRouter, filterByUserId } from "../infrastructure/CreateCrudRouter.mjs";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization.mjs";
import { SettingModel } from "../models/database/Setting.mjs";
import { settingMapper } from "../models/mappers/SettingMapper.mjs";

export const getSettingRouter = (): Router => {
  return createCrudRouter(
    SettingModel,
    settingMapper,
    AuthorizationClaim.UserSettings,
    AuthorizationClaim.UserSettings,
    authorizeUserOwned,
    filterByUserId
  );
};
