import { Router } from "express";
import { Request, Response } from "express";

import { config } from "../infastructure/Config";
import { response } from "../models/responses/IResponseData";
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
pingRouter.get("/", (req: Request, res: Response) => {
  if (config.isEnvironmentProd) {
    res.send(
      response.success<IPingMark>({
        mark: Date.now(),
      })
    );
  } else {
    res.send(
      response.success<IPingMark>({
        mark: Date.now(),
        application: config.packageJson.name,
        version: config.packageJson.version,
      })
    );
  }
});
