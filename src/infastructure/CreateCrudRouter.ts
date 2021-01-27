import { RequestHandler, Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { Document, DocumentQuery, Model, FilterQuery } from "mongoose";

import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { IModelConverter } from "../models/converters/IModelConverter";
import { getResponseFailed, getResponseSuccess } from "../models/IResponseData";
import {
  ISearchRequest,
  searchRequestDescriptor,
} from "../models/requests/ISearchRequest";
import { objectDescriptorBodyVerify } from "./ObjectDescriptor";

const DEFAULT_ITEMS_PER_PAGE = 20;

export type GetFilterFunction<T> = (user: IJwtPayload) => FilterQuery<T>;

export const filterByUserId: GetFilterFunction<Document> = (
  user: IJwtPayload
) => ({ userId: user.sub });

/**
 * @swagger
 * /[ObjectType]:
 *   get:
 *     description: Get the details of a list of [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved [ObjectType] list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   get:
 *     description: Get the details of a specific [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         description: The retrieved [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *
 * @swagger
 * /[ObjectType]:
 *   post:
 *     description: Save a new [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/I[ObjectType]Model'
 *     responses:
 *       200:
 *         description: The added [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   put:
 *     description: Update an existing [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/I[ObjectType]Model'
 *     responses:
 *       200:
 *         description: The updated [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   delete:
 *     description: Delete a specific [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
export const createCrudRouter = <
  TFrontend extends object,
  TBackend extends Document
>(
  model: Model<TBackend, {}>,
  modelConverter: IModelConverter<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string,
  authorizeWriteHandler?: RequestHandler,
  getFilterFunc?: GetFilterFunction<TBackend>,
  isPagingMandatory = true
): Router => {
  const router = Router();

  const getEntityListHandlers: RequestHandler[] = [
    objectDescriptorBodyVerify(searchRequestDescriptor, false),
    async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
      const reqData = req.query as ISearchRequest<TBackend>;

      let query: DocumentQuery<TBackend[], TBackend, {}>;
      if (reqData.query) {
        try {
          if (getFilterFunc) {
            const conditions = Object.assign(
              {},
              reqData.query,
              getFilterFunc(req.user as IJwtPayload)
            );
            query = model.find(conditions);
          } else {
            query = model.find(reqData.query);
          }
        } catch (e) {
          res.status(400);
          res.send(getResponseFailed("The supplied query is invalid"));
          return;
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
          res.send(getResponseFailed("The supplied sort is invalid"));
          return;
        }
      }

      if (isPagingMandatory || reqData.pageSize || reqData.pageNumber) {
        const itemsPerPage = reqData.pageSize
          ? reqData.pageSize
          : DEFAULT_ITEMS_PER_PAGE;
        query = query.limit(itemsPerPage);

        if (reqData.pageNumber) {
          query = query.skip(itemsPerPage * reqData.pageNumber);
        }
      }

      const result = await query.exec();
      const responseData = result.map(e => {
        return modelConverter.convertToFrontend(e);
      });

      const response = getResponseSuccess(responseData);
      res.send(response);
    },
  ];

  const getEntityHandlers: RequestHandler[] = [
    async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
      const entityId = req.params.entityId;

      let query: DocumentQuery<TBackend | null, TBackend, {}>;
      if (getFilterFunc) {
        const conditions = Object.assign(
          { id: entityId },
          getFilterFunc(req.user as IJwtPayload)
        );
        query = model.findOne(conditions);
      } else {
        query = model.findById(entityId);
      }

      const entity = await query.exec();
      if (entity) {
        const response = getResponseSuccess(
          modelConverter.convertToFrontend(entity)
        );
        res.send(response);
      } else {
        res.status(404);
        res.send(getResponseFailed(`Failed to find ID: ${entityId}`));
      }
    },
  ];

  const addEntityHandlers: RequestHandler[] = [
    async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
      const userId = (req.user as IJwtPayload).sub;
      const toSave = modelConverter.convertToBackend(
        req.body,
        undefined,
        `User(${userId})`
      );
      const saveModel = new model(toSave);
      await saveModel.save(error => {
        if (error) {
          let message = error.message;
          if (error.errors) {
            message = error.errors;
          }

          res.status(400);
          return res.send(getResponseFailed(message));
        }

        const response = getResponseSuccess(
          modelConverter.convertToFrontend(saveModel)
        );
        return res.send(response);
      });
    },
  ];

  const updateEntityHandlers: RequestHandler[] = [
    async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
      const entityId = req.params.entityId;
      const toUpdate = await model.findById(entityId).exec();
      if (toUpdate === null) {
        res.status(404);
        res.send(getResponseFailed(`Failed to find ID: ${entityId}`));
        return;
      }

      const userId = (req.user as IJwtPayload).sub;
      const updateModel = modelConverter.convertToBackend(
        req.body,
        toUpdate,
        `User(${userId})`
      );

      return new Promise((resolve, reject) => {
        updateModel.validate(error => {
          if (error) {
            res.status(400);
            res.send(getResponseFailed(error));
            resolve();
          }

          model
            .findByIdAndUpdate(entityId, updateModel, updateError => {
              if (!updateError) {
                const response = getResponseSuccess(
                  modelConverter.convertToFrontend(updateModel)
                );
                res.send(response);
                resolve();
              } else {
                res.status(500);
                res.send(getResponseFailed(updateError.message));
                resolve();
              }
            })
            .exec();
        });
      });
    },
  ];

  const deleteEntityHandlers: RequestHandler[] = [
    async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
      const entityId = req.params.entityId;

      let query: DocumentQuery<TBackend | null, TBackend, {}>;
      if (getFilterFunc) {
        const conditions = Object.assign(
          { id: entityId },
          getFilterFunc(req.user as IJwtPayload)
        );
        query = model.findOneAndDelete(conditions);
      } else {
        query = model.findByIdAndDelete(entityId);
      }

      const deleted = await query.exec();
      if (deleted) {
        res.send(getResponseSuccess());
      } else {
        res.status(404);
        res.send(getResponseFailed(`Failed to delete ID: ${entityId}`));
      }
    },
  ];

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
