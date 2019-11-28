import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { packageJson } from "../infastructure/config";
import { getResponseObject } from "../models/response";

export const pingRouter = Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     description: Get a response to determine if the service is running
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: The package name and version that's running this service
 *         schema:
 *           type: object
 *           properties:
 *             application: { type: string }
 *             version: { type: string }
 */
pingRouter.get("/", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  pingResponse.data = {
    application: packageJson.name,
    version: packageJson.version,
  };

  res.send(pingResponse);
});
