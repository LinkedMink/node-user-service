import { createCrudRouter } from "../infastructure/createCrudRouter";
import { AuthorizationClaim } from "../middleware/authorization";
import { ClaimConverter } from "../models/converters/claimConverter";
import { Claim } from "../models/database/claim";

export const claimRouter = createCrudRouter(
    AuthorizationClaim.ClaimManage,
    Claim,
    new ClaimConverter());
