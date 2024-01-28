import { Router } from "express";
import { createCrudRouter } from "../infrastructure/CreateCrudRouter.mjs";
import { AuthorizationClaim } from "../middleware/Authorization.mjs";
import { ClaimModel } from "../models/database/Claim.mjs";
import { claimMapper } from "../models/mappers/ClaimMapper.mjs";

export const getClaimRouter = (): Router => {
  return createCrudRouter(ClaimModel, claimMapper, AuthorizationClaim.ClaimManage);
};
