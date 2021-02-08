import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { claimMapper } from "../models/mappers/ClaimMapper";
import { Claim } from "../models/database/Claim";

export const claimRouter = createCrudRouter(Claim, claimMapper, AuthorizationClaim.ClaimManage);
