import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { userMapper } from "../models/mappers/UserMapper";
import { User } from "../models/database/User";
import { Router } from "express";

export const getUserRouter = (): Router => {
  return createCrudRouter(User, userMapper, AuthorizationClaim.UserManage);
};
