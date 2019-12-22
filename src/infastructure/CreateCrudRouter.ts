import { RequestHandler, Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { Document, DocumentQuery, Model } from "mongoose";

import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { IModelConverter } from "../models/converters/IModelConverter";
import { getResponseFailed, getResponseSuccess } from "../models/IResponseData";
import { ISearchRequest, searchRequestDescriptor } from "../models/requests/ISearchRequest";
import { objectDescriptorBodyVerify } from "./ObjectDescriptor";

const DEFAULT_ITEMS_PER_PAGE = 20;

export type GetFilterFunction = (user: IJwtPayload) => { [key: string]: any; };

export const filterByUserId = (user: IJwtPayload) => ({ userId: user.sub });

export const createCrudRouter = <TFrontend extends object, TBackend extends Document>(
  model: Model<TBackend, {}>,
  modelConverter: IModelConverter<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string,
  authorizeWriteHandler?: RequestHandler,
  getFilterFunc?: GetFilterFunction) => {

  const router = Router();

  const getEntityListHandlers: RequestHandler[] = [
    objectDescriptorBodyVerify(searchRequestDescriptor, false),
    async (req: Request<ParamsDictionary, any, any>, res: Response) => {
      const reqData = req.query as ISearchRequest;

      let query: DocumentQuery<TBackend[], TBackend, {}>;
      if (reqData.query) {
        try {
          if (getFilterFunc) {
            const conditions = Object.assign({}, reqData.query, getFilterFunc(req.user as IJwtPayload));
            query = model.find(conditions);
          } else {
            query = model.find(reqData.query);
          }
        } catch (e) {
          res.status(400);
          return res.send(getResponseFailed("The supplied query is invalid"));
        }
      } else {
        if (getFilterFunc) {
          query = model.find(getFilterFunc(req.user as IJwtPayload));
        } else {
          query = model.find();
        }
      }

      if (reqData.sort) {
        try {
          query = query.sort(reqData.sort);
        } catch (e) {
          res.status(400);
          return res.send(getResponseFailed("The supplied sort is invalid"));
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

      const response = getResponseSuccess(responseData);
      return res.send(response);
    },
  ];

  const getEntityHandlers: RequestHandler[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const entityId = req.params.entityId;

    let query: DocumentQuery<TBackend | null, TBackend, {}>;
    if (getFilterFunc) {
      const conditions = Object.assign({ id: entityId }, getFilterFunc(req.user as IJwtPayload));
      query = model.findOne(conditions);
    } else {
      query = model.findById(entityId);
    }

    const entity = await query.exec();
    if (entity) {
      const response = getResponseSuccess(modelConverter.convertToFrontend(entity));
      return res.send(response);
    } else {
      res.status(404);
      return res.send(getResponseFailed(`Failed to find ID: ${entityId}`));
    }
  }];

  const addEntityHandlers: RequestHandler[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
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
        return res.send(getResponseFailed(message));
      }

      const response = getResponseSuccess(modelConverter.convertToFrontend(saveModel));
      return res.send(response);
    });
  }];

  const updateEntityHandlers: RequestHandler[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const entityId = req.params.entityId;
    const toUpdate = await model.findById(entityId).exec();
    if (toUpdate === null) {
      res.status(404);
      return res.send(getResponseFailed(`Failed to find ID: ${entityId}`));
    }

    const userId = (req.user as IJwtPayload).sub;
    const updateModel = modelConverter.convertToBackend(req.body, toUpdate, `User(${userId})`);
    await updateModel.validate(async (error) => {
      if (error) {
        res.status(400);
        return res.send(getResponseFailed(error));
      }

      await model.findByIdAndUpdate(entityId, updateModel, (updateError) => {
        if (!updateError) {
          const response = getResponseSuccess(modelConverter.convertToFrontend(updateModel));
          return res.send(response);
        } else {
          res.status(500);
          return res.send(getResponseFailed(updateError.message));
        }
      }).exec();
    });
  }];

  const deleteEntityHandlers: RequestHandler[] = [async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const entityId = req.params.entityId;

    let query: DocumentQuery<TBackend | null, TBackend, {}>;
    if (getFilterFunc) {
      const conditions = Object.assign({ id: entityId }, getFilterFunc(req.user as IJwtPayload));
      query = model.findOneAndDelete(conditions);
    } else {
      query = model.findByIdAndDelete(entityId);
    }

    const deleted = await query.exec();
    if (deleted) {
      return res.send(getResponseSuccess());
    } else {
      res.status(404);
      return res.send(getResponseFailed(`Failed to delete ID: ${entityId}`));
    }
  }];

  if (authorizeWriteHandler) {
    addEntityHandlers.unshift(authorizeWriteHandler);
    updateEntityHandlers.unshift(authorizeWriteHandler);
  }

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
