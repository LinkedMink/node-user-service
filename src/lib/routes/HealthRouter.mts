import { Request, Response, Router } from "express";
import { config } from "../infrastructure/Config.mjs";
import { HealthResponse } from "../models/responses/HealthResponse.mjs";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  const messageObj: HealthResponse = config.isEnvironmentProd
    ? {
        mark: Date.now(),
      }
    : {
        mark: Date.now(),
        application: config.packageJson.name,
        version: config.packageJson.version,
      };

  res.send(messageObj);
});
