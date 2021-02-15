import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { claimMapper } from "../models/mappers/ClaimMapper";
import { Claim } from "../models/database/Claim";
import { Router } from "express";

export const getClaimRouter = (): Router => {
  return createCrudRouter(Claim, claimMapper, AuthorizationClaim.ClaimManage);
}
