import { ITrackedEntityModel } from "./ITrackedEntityModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     IClaimModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         applications:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - name
 *         - applications
 *     ClaimModelResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/IClaimModel'
 */
export interface IClaimModel extends ITrackedEntityModel {
  name: string;
  applications: string[];
}
