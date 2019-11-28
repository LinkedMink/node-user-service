import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { getResponseObject } from "../models/response";

export const registerRouter = Router();
// TODO

/**
 * @swagger
 * /register:
 *   post:
 *     description: Register a new user
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The user was registered successfully.
 */
registerRouter.post("/", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  res.send(pingResponse);
});

/**
 * @swagger
 * /register:
 *   get:
 *     description: Verify the email address of the specified user
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The user was registered successfully.
 */
registerRouter.get("/:email/:code", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  res.send(pingResponse);
});

/**
 * @swagger
 * /register:
 *   put:
 *     description: Send the verification email again
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The user was registered successfully.
 */
registerRouter.get("/:email", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  res.send(pingResponse);
});
