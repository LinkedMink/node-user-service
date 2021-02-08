import { Request, Response, NextFunction } from "express";
import { Document, Model, Query } from "mongoose";

import { IUserSession } from "../middleware/Passport";
import { IModelMapper } from "../models/mappers/IModelMapper";
import { response } from "../models/responses/IResponseData";
import { IListRequest } from "../models/requests/IListRequest";
import { Logger } from "../infastructure/Logger";
import { isMongooseValidationError } from "../infastructure/TypeCheck";
import { GetFilterFunction } from "../infastructure/CreateCrudRouter";

const DEFAULT_ITEMS_PER_PAGE = 20;

export class CrudController<TFrontend, TBackend extends Document<unknown>> {
  private readonly logger = Logger.get(CrudController.name);

  constructor(
    private readonly model: Model<TBackend>,
    private readonly mapper: IModelMapper<TFrontend, TBackend>,
    private readonly getFilterFunc?: GetFilterFunction<TBackend>,
    private readonly isPagingMandatory = true
  ) {}

  getListHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const reqData = req.query as IListRequest<TBackend>;

    let query: Query<TBackend[], TBackend>;
    if (reqData.query) {
      try {
        if (this.getFilterFunc) {
          const conditions = Object.assign(
            {},
            reqData.query,
            this.getFilterFunc(req.user as IUserSession)
          );
          query = this.model.find(conditions);
        } else {
          query = this.model.find(reqData.query);
        }
      } catch (e) {
        res.status(400);
        res.send(response.failed("The supplied query is invalid"));
        return;
      }
    } else {
      if (this.getFilterFunc) {
        query = this.model.find(this.getFilterFunc(req.user as IUserSession));
      } else {
        query = this.model.find();
      }
    }

    if (reqData.sort) {
      try {
        query = query.sort(reqData.sort);
      } catch (e) {
        res.status(400);
        res.send(response.failed("The supplied sort is invalid"));
        return;
      }
    }

    if (this.isPagingMandatory || reqData.pageSize || reqData.pageNumber) {
      const itemsPerPage = reqData.pageSize ? reqData.pageSize : DEFAULT_ITEMS_PER_PAGE;
      query = query.limit(itemsPerPage);

      if (reqData.pageNumber) {
        query = query.skip(itemsPerPage * reqData.pageNumber);
      }
    }

    const result = await query.exec();
    const responseData = result.map(e => {
      return this.mapper.convertToFrontend(e);
    });

    res.send(response.success(responseData));
  };

  getHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;

    let query: Query<TBackend | null, TBackend>;
    if (this.getFilterFunc) {
      const conditions = Object.assign(
        { id: entityId },
        this.getFilterFunc(req.user as IUserSession)
      );
      query = this.model.findOne(conditions);
    } else {
      query = this.model.findById(entityId);
    }

    const entity = await query.exec();
    if (entity) {
      res.send(response.success(this.mapper.convertToFrontend(entity)));
    } else {
      res.status(404);
      res.send(response.failed(`Failed to find ID: ${entityId}`));
    }
  };

  addHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req.user as IUserSession).sub;
    const toSave = this.mapper.convertToBackend(req.body, undefined, `User(${userId})`);

    const saveModel = new this.model(toSave);

    await new Promise<void>((resolve, reject) => {
      saveModel.save((error, doc) => {
        if (isMongooseValidationError(error)) {
          this.logger.info({ message: error });
          res.status(400).send(error.errors);
          return resolve();
        } else if (error) {
          this.logger.error({ message: error });
          return resolve();
        }

        res.send(response.success(this.mapper.convertToFrontend(doc)));
        resolve();
      });
    });
  };

  updateHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;
    const toUpdate = await this.model.findById(entityId).exec();
    if (toUpdate === null) {
      res.status(404);
      res.send(response.failed(`Failed to find ID: ${entityId}`));
      return;
    }

    const userId = (req.user as IUserSession).sub;
    const updateModel = this.mapper.convertToBackend(req.body, toUpdate, `User(${userId})`);

    await new Promise<void>((resolve, reject) => {
      updateModel.save((error, doc) => {
        if (isMongooseValidationError(error)) {
          this.logger.info({ message: error });
          res.status(400).send(error.errors);
          return resolve();
        } else if (error) {
          this.logger.error({ message: error });
          return resolve();
        }

        res.send(response.success(this.mapper.convertToFrontend(doc)));
        resolve();
      });
    });
  };

  deleteHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;

    let query: Query<TBackend | null, TBackend>;
    if (this.getFilterFunc) {
      const conditions = Object.assign(
        { id: entityId },
        this.getFilterFunc(req.user as IUserSession)
      );
      query = this.model.findOneAndDelete(conditions);
    } else {
      query = this.model.findByIdAndDelete(entityId);
    }

    const deleted = await query.exec();
    if (deleted) {
      res.send(response.success());
    } else {
      res.status(404);
      res.send(response.failed(`Failed to delete ID: ${entityId}`));
    }
  };
}
