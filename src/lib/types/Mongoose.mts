import mongoose from "mongoose";

export type MongooseDocument<TDoc extends object, TId = mongoose.Types.ObjectId> = TDoc &
  // eslint-disable-next-line @typescript-eslint/ban-types
  mongoose.Document<unknown, {}, TDoc> &
  Required<{
    _id: TId;
  }>;
