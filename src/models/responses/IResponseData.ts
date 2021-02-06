export enum ResponseStatus {
  Success = 0,
  Failed = 1,
  RequestValidation = 10,
  DataValidation = 11,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       properties:
 *         status:
 *           type: integer
 *           format: int32
 *           example: 0
 *           description: '{
 *             Success = 0,
 *             Failed = 1,
 *             RequestValidation = 10,
 *             DataValidation = 11}'
 *     ErrorResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           type: string
 *           description: An error message
 *     ObjectResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           type: object
 *           nullable: true
 *           description: A generic object
 *     ArrayResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           description: A generic array
 */
export interface IResponseData<T = null> {
  status: ResponseStatus;
  data: T;
}

export const response = {
  get: <T>(
    status: ResponseStatus = ResponseStatus.Success,
    data: T | null = null
  ): IResponseData<T> => ({ status, data } as IResponseData<T>),
  success: <T>(data: T | null = null): IResponseData<T> =>
    ({ status: ResponseStatus.Success, data } as IResponseData<T>),
  failed: <T>(data: T | null = null): IResponseData<T> =>
    ({ status: ResponseStatus.Failed, data } as IResponseData<T>),
};
