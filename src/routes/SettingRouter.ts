import { createCrudRouter, filterByUserId } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization";
import { settingConverter } from "../models/converters/SettingConverter";
import { Setting } from "../models/database/Setting";

/**
 * @swagger
 * /Settings:
 *   get:
 *     description: Get the details of a list of Settings
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved Settings list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SettingsModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 * 
 * @swagger
 * /Settings/{id}:
 *   get:
 *     description: Get the details of a specific Settings
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         description: The retrieved Settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettingsModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 * 
 * @swagger
 * /Settings:
 *   post:
 *     description: Save a new Settings
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ISettingsModel'
 *     responses:
 *       200:
 *         description: The added Settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettingsModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 * 
 * @swagger
 * /Settings/{id}:
 *   put:
 *     description: Update an existing Settings
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ISettingsModel'
 *     responses:
 *       200:
 *         description: The updated Settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettingsModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 * 
 * @swagger
 * /Settings/{id}:
 *   delete:
 *     description: Delete a specific Settings
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
export const settingRouter = createCrudRouter(
    Setting,
    settingConverter,
    AuthorizationClaim.UserSettings,
    AuthorizationClaim.UserSettings,
    authorizeUserOwned,
    filterByUserId);
