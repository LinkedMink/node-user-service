/**
 * @swagger
 * components:
 *   schemas:
 *     IPingMark:
 *       type: object
 *       properties:
 *         mark:
 *           type: integer
 *           format: int64
 *           example: 1591227886882
 *         application:
 *           type: string
 *           example: node-user-service
 *         version:
 *           type: string
 *           nullable: true
 *           example: 0.9.7
 *     PingMarkResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/IPingMark'
 */
export interface IPingMark {
  mark: number;
  application?: string;
  version?: string;
}
