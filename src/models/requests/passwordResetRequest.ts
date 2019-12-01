import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/objectDescriptor";

export interface IPasswordResetRequest {
  email: string;
  resetToken: string;
  password: string;
}

export const passwordResetRequestDescriptor = new ObjectDescriptor<IPasswordResetRequest>({
  email: [ObjectAttribute.Required],
  resetToken: [ObjectAttribute.Required],
  password: [ObjectAttribute.Required],
});
