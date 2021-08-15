import { Router } from "express";
import { Document, Model, ObjectId } from "mongoose";
import { createCrudRouter, filterByUserId } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization";
import { settingMapper } from "../models/mappers/SettingMapper";
import { Setting } from "../models/database/Setting";

export const getSettingRouter = (): Router => {
  return createCrudRouter(
    Setting as unknown as Model<Document<ObjectId>>,
    settingMapper,
    AuthorizationClaim.UserSettings,
    AuthorizationClaim.UserSettings,
    authorizeUserOwned,
    filterByUserId
  );
};
