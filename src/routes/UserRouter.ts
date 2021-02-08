import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { userMapper } from "../models/mappers/UserMapper";
import { User } from "../models/database/User";

export const userRouter = createCrudRouter(User, userMapper, AuthorizationClaim.UserManage);
