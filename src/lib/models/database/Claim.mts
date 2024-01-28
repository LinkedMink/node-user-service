import mongoose from "mongoose";
import { MongooseDocument } from "../../types/Mongoose.mjs";
import { EditRecordDocument, editRecordSchema } from "./EditRecord.mjs";

export interface Claim {
  _id: mongoose.Types.ObjectId;
  name: string;
  applications: mongoose.Types.Array<string>;
  edited: EditRecordDocument;
}

export type ClaimDocument = MongooseDocument<Claim>;

const claimSchema = new mongoose.Schema<Claim>({
  name: {
    type: mongoose.SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
  applications: {
    type: [mongoose.SchemaTypes.String],
    required: true,
  },
  edited: {
    type: editRecordSchema,
    required: true,
    default: {},
  },
});

export const ClaimModel = mongoose.model<Claim>("Claim", claimSchema);
