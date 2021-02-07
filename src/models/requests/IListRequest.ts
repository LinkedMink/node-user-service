import { FilterQuery } from "mongoose";

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
 *       required: false
 *       schema:
 *         type: string
 *     listQuery:
 *     - in: query
 *       name: query
 *       required: false
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
