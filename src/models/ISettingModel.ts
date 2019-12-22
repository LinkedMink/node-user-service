import { IUserEntityModel } from "./IUserEntityModel";

/**
 * @swagger
 * definitions:
 *   ISettingsModel:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *       name:
 *         type: string
 *       applications:
 *         type: array
 *         items:
 *           type: string
 *       data:
 *         type: object
 *     required:
 *       - userId
 *       - name
 *       - applications
 *       - data
 */
export interface ISettingModel extends IUserEntityModel {
  name: string;
  applications: string[];
  data: any;
}
