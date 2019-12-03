export enum ResponseStatus {
  Success = 0,
  Failed = 1,
}

/**
 * @swagger
 * definitions:
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       status:
 *         type: integer
 *       data:
 *         type: string
 */
export interface IResponseObject {
  status: ResponseStatus;
  data: object | string | null;
}

export function getResponseObject(
  status: ResponseStatus = ResponseStatus.Success,
  data: object | string | null = null): IResponseObject {

  return { status, data };
}
