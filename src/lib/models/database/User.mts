import mongoose from "mongoose";
import { MongooseDocument } from "../../types/Mongoose.mjs";
import { EditRecordDocument, editRecordSchema } from "./EditRecord.mjs";
import {
  AnyIdentity,
  IdentityType,
  emailPasswordSchema,
  identitySchema,
  publicKeySchema,
} from "./Identity.mjs";

export interface UserClaim {
  _id: undefined;
  name: string;
}

export interface User {
  _id: mongoose.Types.ObjectId;
  id: string;
  username: string;
  identities: mongoose.Types.DocumentArray<AnyIdentity>;
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationAttempts?: number;
  authenticationDates: mongoose.Types.Array<Date>;
  claims: mongoose.Types.DocumentArray<UserClaim>;
  edited: EditRecordDocument;
}

export type UserDocument = MongooseDocument<User>;

const userClaimSchema = new mongoose.Schema<UserClaim>(
  {
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema<User>({
  username: {
    type: mongoose.SchemaTypes.String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
  identities: [identitySchema],
  isLocked: {
    type: mongoose.SchemaTypes.Boolean,
    required: true,
  },
  isLockedDate: {
    type: mongoose.SchemaTypes.Date,
  },
  authenticationAttempts: {
    type: mongoose.SchemaTypes.Number,
  },
  authenticationDates: [mongoose.SchemaTypes.Date],
  // TODO validate claims exist, include ID to reference
  claims: [userClaimSchema],
  edited: {
    type: editRecordSchema,
    required: true,
    default: {},
  },
});

userSchema.post("validate", function (this) {
  if (!this.isLocked && this.modifiedPaths().includes("isLocked")) {
    this.authenticationAttempts = undefined;
    this.isLockedDate = undefined;
  }
});

const identitiesSchema = userSchema.path<mongoose.Schema.Types.DocumentArray>("identities");
identitiesSchema.discriminator(IdentityType.EmailPassword, emailPasswordSchema);
identitySchema.discriminator(IdentityType.PublicKey, publicKeySchema);

export const UserModel = mongoose.model<User>("User", userSchema);
