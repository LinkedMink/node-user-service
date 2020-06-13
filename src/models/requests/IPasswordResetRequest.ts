import { config, ConfigKey } from "../../infastructure/Config";
import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/ObjectDescriptor";

/**
 * @swagger
 * components:
 *   schemas:
 *     IPasswordResetRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         resetToken:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *       required:
 *         - email
 *         - resetToken
 *         - password
 */
export interface IPasswordResetRequest {
  email: string;
  resetToken: string;
  password: string;
}

export const passwordResetRequestDescriptor = new ObjectDescriptor<IPasswordResetRequest>({
  email: [ObjectAttribute.Required],
  resetToken: [ObjectAttribute.Required],
  password: [
    ObjectAttribute.Required,
    {
      value: ObjectAttribute.Length,
      params: { min: config.getNumber(ConfigKey.UserPassMinLength) },
    },
  ],
});
