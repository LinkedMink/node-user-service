import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/objectDescriptor";

export interface IRegisterRequest {
  email: string;
  password: string;
}

export const registerRequestDescriptor = new ObjectDescriptor<IRegisterRequest>({
  email: [ObjectAttribute.Required],
  password: [ObjectAttribute.Required],
});
