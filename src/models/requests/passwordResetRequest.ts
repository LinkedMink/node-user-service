import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/objectDescriptor";

export interface IPasswordResetRequest {
  resetToken: string;
  password: string;
}

export const passwordResetRequestDescriptor = new ObjectDescriptor<IPasswordResetRequest>({
  resetToken: [ObjectAttribute.Required],
  password: [ObjectAttribute.Required],
});
