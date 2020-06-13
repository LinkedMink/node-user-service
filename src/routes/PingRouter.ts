import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { config } from "../infastructure/Config";
import { getResponseObject } from "../models/IResponseData";
import { IPingMark } from "../models/responses/IPingMark";

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PingMarkResponse'
 */
pingRouter.get("/", (req: Request<ParamsDictionary>, res: Response) => {
  const pingResponse = getResponseObject();

  pingResponse.data = {
    mark: Date.now(),
    application: config.packageJson.name,
    version: config.packageJson.version,
  } as IPingMark;

  res.send(pingResponse);
});
