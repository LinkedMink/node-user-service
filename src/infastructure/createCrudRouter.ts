import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { Document, Model } from "mongoose";
import { authorizeJwtClaim } from "../middleware/authorization";
import { IJwtPayload } from "../middleware/passport";
import { IModelConverter } from "../models/converters/modelConverter";
import { getResponseObject, ResponseStatus } from "../models/response";

export const createCrudRouter = <TFrontend extends object, TBackend extends Document>(
  requiredClaim: string,
  model: Model<TBackend, {}>,
  modelConverter: IModelConverter<TFrontend, TBackend>) => {

  const router = Router();

  // TODO improve list query
  router.get("/", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const itemsPerPage = 20;
      const page = Number(req.query.page);
      if (page && (Number.isNaN(page) || !Number.isInteger(page) || page < 0)) {
        res.status(400);
        return res.send(getResponseObject(ResponseStatus.Failed, `page: must be an integer 0 or greater`));
      }

      const query = model.find().limit(itemsPerPage);
      if (page) {
        query.skip(itemsPerPage * page);
      }
      const result = await query.exec();

      const responseData = result.map(async (e) => {
        return modelConverter.convertToFrontend(e);
      });

      const response = getResponseObject();
      response.data = responseData;
      return res.send(response);
    });

  router.get("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const entity = await model.findById(entityId).exec();

      if (entity) {
        const response = getResponseObject();
        response.data = modelConverter.convertToFrontend(entity);
        return res.send(response);
      } else {
        res.status(404);
        return res.send(getResponseObject(ResponseStatus.Failed, `Failed to find ID: ${entityId}`));
      }
    });

  router.post("/", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const userId = (req.user as IJwtPayload).sub;
      const toSave = modelConverter.convertToBackend(req.body, undefined, `User(${userId})`);
      const saveModel = new model(toSave);
      await saveModel.save((error) => {
        if (error) {
          let message = error.message;
          if (error.errors) {
            message = error.errors;
          }

          res.status(400);
          return res.send(getResponseObject(ResponseStatus.Failed, message));
        }

        const response = getResponseObject();
        response.data = modelConverter.convertToFrontend(saveModel);
        return res.send(response);
      });
    });

  router.put("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const toUpdate = await model.findById(entityId).exec();
      if (toUpdate === null) {
        res.status(404);
        return res.send(getResponseObject(ResponseStatus.Failed, `Failed to find ID: ${entityId}`));
      }

      const userId = (req.user as IJwtPayload).sub;
      const updateModel = modelConverter.convertToBackend(req.body, toUpdate, `User(${userId})`);
      await updateModel.validate(async (error) => {
        if (error) {
          res.status(400);
          return res.send(getResponseObject(ResponseStatus.Failed, error));
        }

        await model.findByIdAndUpdate(entityId, updateModel, (updateError) => {
          if (!updateError) {
            const response = getResponseObject();
            response.data = modelConverter.convertToFrontend(updateModel);
            return res.send(response);
          } else {
            res.status(500);
            return res.send(getResponseObject(ResponseStatus.Failed, updateError.message));
          }
        }).exec();
      });
    });

  router.delete("/:entityId", authorizeJwtClaim([requiredClaim]),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const entityId = req.params.entityId;
      const deleted = await model.findByIdAndDelete(entityId).exec();

      if (deleted) {
        return res.send(getResponseObject());
      } else {
        res.status(404);
        return res.send(getResponseObject(ResponseStatus.Failed, `Failed to delete ID: ${entityId}`));
      }
    });

  return router;
};
