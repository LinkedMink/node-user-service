import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { Document, DocumentQuery, Model } from "mongoose";

import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { IModelConverter } from "../models/converters/IModelConverter";
import { getResponseObject, ResponseStatus } from "../models/IResponseData";
import { ISearchRequest, searchRequestDescriptor } from "../models/requests/ISearchRequest";
import { objectDescriptorBodyVerify } from "./ObjectDescriptor";

const DEFAULT_ITEMS_PER_PAGE = 20;

export const createCrudRouter = <TFrontend extends object, TBackend extends Document>(
  model: Model<TBackend, {}>,
  modelConverter: IModelConverter<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string) => {

  const router = Router();

  const getEntityListHandlers: any[] = [
    objectDescriptorBodyVerify(searchRequestDescriptor, false),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const reqData = req.query as ISearchRequest;

      let query: DocumentQuery<TBackend[], TBackend, {}>;
      if (reqData.query) {
        try {
          query = model.find(reqData.query);
        } catch (e) {
          res.status(400);
          return res.send(getResponseObject(ResponseStatus.Failed, "The supplied query is invalid"));
        }
      } else {
        query = model.find();
      }

      if (reqData.sort) {
        try {
          query = query.sort(reqData.sort);
        } catch (e) {
          res.status(400);
          return res.send(getResponseObject(ResponseStatus.Failed, "The supplied sort is invalid"));
        }
      }

      const itemsPerPage = reqData.pageSize ? reqData.pageSize : DEFAULT_ITEMS_PER_PAGE;
      query = query.limit(itemsPerPage);

      if (reqData.pageNumber) {
        query = query.skip(itemsPerPage * reqData.pageNumber);
      }

      const result = await query.exec();
      const responseData = result.map((e) => {
        return modelConverter.convertToFrontend(e);
      });

      const response = getResponseObject();
      response.data = responseData;
      return res.send(response);
    },
  ];

  const getEntityHandlers: any[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
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
  }];

  const addEntityHandlers: any[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
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
  }];

  const updateEntityHandlers: any[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
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
  }];

  const deleteEntityHandlers: any[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const entityId = req.params.entityId;
    const deleted = await model.findByIdAndDelete(entityId).exec();

    if (deleted) {
      return res.send(getResponseObject());
    } else {
      res.status(404);
      return res.send(getResponseObject(ResponseStatus.Failed, `Failed to delete ID: ${entityId}`));
    }
  }];

  if (requiredClaimRead) {
    const authorizeRead = authorizeJwtClaim([requiredClaimRead]);
    getEntityListHandlers.unshift(authorizeRead);
    getEntityHandlers.unshift(authorizeRead);

    const authorizeWrite = requiredClaimWrite
      ? authorizeJwtClaim([requiredClaimWrite])
      : authorizeRead;

    addEntityHandlers.unshift(authorizeWrite);
    updateEntityHandlers.unshift(authorizeWrite);
    deleteEntityHandlers.unshift(authorizeWrite);
  }

  router.get("/", getEntityListHandlers);
  router.get("/:entityId", getEntityHandlers);
  router.post("/", addEntityHandlers);
  router.put("/:entityId", updateEntityHandlers);
  router.delete("/:entityId", deleteEntityHandlers);

  return router;
};
