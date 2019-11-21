export enum ResponseStatus {
  Success = "success",
  Failed = "failed",
}

export interface IResponseObject {
  status: ResponseStatus;
  data: object | string | null;
}

export function getResponseObject(
  status: ResponseStatus = ResponseStatus.Success,
  data: object | string | null = null): IResponseObject {

  return { status, data };
}
