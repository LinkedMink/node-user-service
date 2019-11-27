import { createCrudRouter } from "../infastructure/createCrudRouter";
import { AuthorizationClaim } from "../middleware/authorization";
import { UserConverter } from "../models/converters/userConverter";
import { User } from "../models/database/user";

export const userRouter = createCrudRouter(
    AuthorizationClaim.UserManage,
    User,
    new UserConverter());
