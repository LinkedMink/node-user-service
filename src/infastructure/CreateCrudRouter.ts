import { RequestHandler, Router } from "express";
import { Document, Model, FilterQuery } from "mongoose";

import { authenticateJwt, authorizeJwtClaim } from "../middleware/Authorization";
import { IUserSession } from "../middleware/Passport";
import { IModelMapper } from "../models/mappers/IModelMapper";
import { CrudController } from "../controllers/CrudController";

export type GetFilterFunction<T> = (user: IUserSession) => FilterQuery<T>;

export const filterByUserId: GetFilterFunction<Document> = (user: IUserSession) => ({
  userId: user.sub,
});

export const createCrudRouter = <TFrontend, TBackend extends Document<unknown>>(
  model: Model<TBackend>,
  modelConverter: IModelMapper<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string,
  authorizeWriteHandler?: RequestHandler,
  getFilterFunc?: GetFilterFunction<TBackend>,
  isPagingMandatory = true
): Router => {
  const router = Router();
  const controller = new CrudController(model, modelConverter, getFilterFunc, isPagingMandatory);

  const getEntityListHandlers: RequestHandler[] = [];
  const getEntityHandlers: RequestHandler[] = [];
  const addEntityHandlers: RequestHandler[] = [];
  const updateEntityHandlers: RequestHandler[] = [];
  const deleteEntityHandlers: RequestHandler[] = [];

  if (requiredClaimRead || requiredClaimWrite || authorizeWriteHandler) {
    getEntityListHandlers.push(authenticateJwt);
    getEntityHandlers.push(authenticateJwt);
    addEntityHandlers.push(authenticateJwt);
    updateEntityHandlers.push(authenticateJwt);
    deleteEntityHandlers.push(authenticateJwt);
  }

  if (requiredClaimRead) {
    const authorizeRead = authorizeJwtClaim([requiredClaimRead]);
    getEntityListHandlers.push(authorizeRead);
    getEntityHandlers.push(authorizeRead);

    const authorizeWrite = requiredClaimWrite
      ? authorizeJwtClaim([requiredClaimWrite])
      : authorizeRead;

    addEntityHandlers.push(authorizeWrite);
    updateEntityHandlers.push(authorizeWrite);
    deleteEntityHandlers.push(authorizeWrite);
  }

  if (authorizeWriteHandler) {
    addEntityHandlers.push(authorizeWriteHandler);
    updateEntityHandlers.push(authorizeWriteHandler);
  }

  getEntityListHandlers.push(controller.getListHandler);
  getEntityHandlers.push(controller.getHandler);
  addEntityHandlers.push(controller.addHandler);
  updateEntityHandlers.push(controller.updateHandler);
  deleteEntityHandlers.push(controller.deleteHandler);

  router.get("/", getEntityListHandlers);
  router.get("/:entityId", getEntityHandlers);
  router.post("/", addEntityHandlers);
  router.put("/:entityId", updateEntityHandlers);
  router.delete("/:entityId", deleteEntityHandlers);

  return router;
};
