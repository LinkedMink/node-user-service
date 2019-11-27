import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { Document, Model } from "mongoose";
import { authorizeJwtClaim } from "../middleware/authorization";
import { IModelConverter } from "../models/converters/modelConverter";
import { getResponseObject, ResponseStatus } from "../models/response";

export const createCrudRouter = <TFrontend extends object, TBackend extends Document>(
  requiredClaim: string,
  model: Model<TBackend, {}>,
  modelConverter: IModelConverter<TFrontend, TBackend>) => {

  const router = Router();

  router.get("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const entity = await model.findById(entityId).exec();

      if (entity) {
        const response = getResponseObject();
        response.data = modelConverter.convertToFrontend(entity);
        res.send(response);
      } else {
        res.status(404);
        res.send(getResponseObject(ResponseStatus.Failed, `Failed to find ID: ${entityId}`));
      }
    });

  router.post("/", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      let isSuccessful = true;
      const toSave = modelConverter.convertToBackend(req.body);
      const saveModel = new model(toSave);
      const saved = await saveModel.save((error) => {
        if (error) {
          res.status(500);
          res.send(getResponseObject(ResponseStatus.Failed, `Failed to save:`));
          isSuccessful = false;
        }
      });

      if (isSuccessful) {
        const response = getResponseObject();
        response.data = modelConverter.convertToFrontend(saved);
        res.send(response);
      }
    });

  router.put("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const updateModel = modelConverter.convertToBackend(req.body);
      const updated = await model.findByIdAndUpdate(entityId, updateModel).exec();

      if (updated) {
        const response = getResponseObject();
        response.data = modelConverter.convertToFrontend(updated);
        res.send(response);
      } else {
        res.status(404);
        res.send(getResponseObject(ResponseStatus.Failed, `Failed to find ID: ${entityId}`));
      }
    });

  router.delete("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const deletedCount = await model.findByIdAndDelete(entityId).exec();

      if (deletedCount) {
        res.send(getResponseObject());
      } else {
        res.status(404);
        res.send(getResponseObject(ResponseStatus.Failed, `Failed to delete ID: ${entityId}`));
      }
    });

  return router;
};
