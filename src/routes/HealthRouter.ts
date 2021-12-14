import { Router } from "express";
import { Request, Response } from "express";

import { config } from "../infastructure/Config";
import { response } from "../models/responses/IResponseData";
import { IHealthResponse } from "../models/responses/IHealthResponse";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  if (config.isEnvironmentProd) {
    res.send(
      response.success<IHealthResponse>({
        mark: Date.now(),
      })
    );
  } else {
    res.send(
      response.success<IHealthResponse>({
        mark: Date.now(),
        application: config.packageJson.name,
        version: config.packageJson.version,
      })
    );
  }
});
