import { NextFunction, ParamsDictionary, Request, Response } from "express-serve-static-core";
import { getResponseObject, ResponseStatus } from "../models/response";

export enum ObjectAttribute {
  Required,
}

export class ObjectDescriptor<TVerify> {
  constructor(
    private descriptors: { [key: string]: ObjectAttribute[]; }) {}

  public verify = (toVerify: any): string[] | TVerify => {
    const errors: string[] = [];
    for (const key of Object.keys(this.descriptors)) {
      if (this.descriptors[key].includes(ObjectAttribute.Required) && !toVerify[key]) {
        errors.push(`${key}: Required`);
      }
    }

    return toVerify as TVerify;
  }
}

export const objectDescriptorBodyVerify = <TVerify>(descriptor: ObjectDescriptor<TVerify>) => {
  return (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(400);
      return res.send(getResponseObject(ResponseStatus.Failed, "Empty Body"));
    }

    const modelCheck = descriptor.verify(req.body);
    if ((modelCheck as string[]).length) {
      res.status(400);
      return res.send(getResponseObject(
        ResponseStatus.Failed, (modelCheck as string[]).join(" ")));
    }

    next();
  };
};
