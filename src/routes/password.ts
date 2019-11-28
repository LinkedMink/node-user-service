import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { getResponseObject } from "../models/response";

export const passwordRouter = Router();
// TODO
/**
 * @swagger
 * /password:
 *   post:
 *     description: Send a request to retrieve a temporary reset link
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
passwordRouter.get("/:email", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  res.send(pingResponse);
});

/**
 * @swagger
 * /password:
 *   put:
 *     description: Send a request to retrieve a temporary reset link
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
passwordRouter.put("/:email", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  res.send(pingResponse);
});
