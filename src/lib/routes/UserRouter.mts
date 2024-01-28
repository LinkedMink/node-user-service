import { Router } from "express";
import { createCrudRouter } from "../infrastructure/CreateCrudRouter.mjs";
import { AuthorizationClaim } from "../middleware/Authorization.mjs";
import { UserModel } from "../models/database/User.mjs";
import { userMapper } from "../models/mappers/UserMapper.mjs";

export const getUserRouter = (): Router => {
  return createCrudRouter(UserModel, userMapper, AuthorizationClaim.UserManage);
};
