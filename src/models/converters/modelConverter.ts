import { Document } from "mongoose";

export interface IModelConverter<TFrontend extends object, TBackend extends Document> {
  convertToFrontend(model: TBackend): TFrontend | Promise<TFrontend>;
  convertToBackend(model: TFrontend, existing?: TBackend): TBackend | Promise<TBackend>;
}
