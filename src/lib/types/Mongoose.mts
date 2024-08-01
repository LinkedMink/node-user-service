import mongoose from "mongoose";

export type MongooseDocument<TDoc extends object, TId = mongoose.Types.ObjectId> = TDoc &
  mongoose.Document<unknown, object, TDoc> &
  Required<{
    _id: TId;
  }>;
