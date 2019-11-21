import express from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { packageJson } from "../infastructure/config";
import { getResponseObject } from "../infastructure/response";

export const pingRouter = express.Router();

pingRouter.get("/ping", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const pingResponse = getResponseObject();
  pingResponse.data = {
    application: packageJson.name,
    version: packageJson.version,
  };

  res.send(pingResponse);
});
