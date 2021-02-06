import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/ObjectDescriptor";
import { Document, FilterQuery } from "mongoose";

export enum SortOrder {
  Descending = "dsc",
  Ascending = "asc",
}

/**
 * @swagger
 * components:
 *   parameters:
 *     listPageSize:
 *     - in: query
 *       name: pageSize
 *       required: false
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *         maximum: 100
 *     listPageNumber:
 *     - in: query
 *       name: pageNumber
 *       required: false
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 0
 *     listSort:
 *     - in: query
 *       name: sort
 *       schema:
 *         type: string
 *     listQuery:
 *     - in: query
 *       name: query
 *       schema:
 *         type: string
 *   schemas:
 *     IListRequest:
 *       type: object
 *       properties:
 *         pageSize:
 *           type: integer
 *           format: int32
 *           example: 50
 *         pageNumber:
 *           type: integer
 *           format: int32
 *           example: 0
 *         sort:
 *           type: object
 *           additionalProperties:
 *             type: string
 *             enum: [asc, dsc]
 *         query:
 *           type: object
 *           additionalProperties:
 *             type: string
 */
export interface IListRequest<T> {
  pageSize?: number;
  pageNumber?: number;
  sort?: Record<string, SortOrder>;
  query?: FilterQuery<T>;
}

export const searchRequestDescriptor = new ObjectDescriptor<IListRequest<Document<unknown>>>(
  {
    pageSize: [
      {
        value: ObjectAttribute.Range,
        params: { min: 1, max: 100 },
      },
    ],
    pageNumber: [
      {
        value: ObjectAttribute.Range,
        params: { min: 0 },
      },
    ],
  },
  true,
  (toSanitize: IListRequest<Document<unknown>>) => {
    if (toSanitize.pageSize) {
      toSanitize.pageSize = Number(toSanitize.pageSize);
    }
    if (toSanitize.pageSize) {
      toSanitize.pageNumber = Number(toSanitize.pageNumber);
    }
    if (toSanitize.sort) {
      toSanitize.sort = JSON.parse((toSanitize.sort as unknown) as string) as Record<
        string,
        SortOrder
      >;
    }
    if (toSanitize.query) {
      toSanitize.query = JSON.parse(
        (toSanitize.query as unknown) as string
      ) as FilterQuery<unknown>;
    }
    return toSanitize;
  }
);
