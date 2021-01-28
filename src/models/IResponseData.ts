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
export interface IResponseData {
  status: ResponseStatus;
  data: object[] | object | string | null;
}

export const getResponseObject = (
  status: ResponseStatus = ResponseStatus.Success,
  data: object[] | object | string | null = null
): IResponseData => {
  return { status, data };
};

export const getResponseSuccess = (
  data: object[] | object | string | null = null
): IResponseData => {
  return { status: ResponseStatus.Success, data };
};

export const getResponseFailed = (
  data: object[] | object | string | null = null
): IResponseData => {
  return { status: ResponseStatus.Failed, data };
};
