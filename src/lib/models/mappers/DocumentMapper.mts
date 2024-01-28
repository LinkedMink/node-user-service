import { MongooseDocument } from "../../types/Mongoose.mjs";

export interface DocumentMapper<TFrontend, TBackend extends object> {
  convertToFrontend(model: MongooseDocument<TBackend, unknown>): TFrontend;
  convertToBackend(
    model: TFrontend,
    existing?: MongooseDocument<TBackend, unknown>,
    modifier?: string
  ): MongooseDocument<TBackend, unknown>;
}
