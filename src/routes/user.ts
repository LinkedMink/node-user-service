import { createCrudRouter } from "../infastructure/createCrudRouter";
import { UserConverter } from "../models/converters/userConverter";
import { User } from "../models/database/user";

const USER_MANAGE_CLAIM = "UserManage";

export const userRouter = createCrudRouter(USER_MANAGE_CLAIM, User, new UserConverter());
