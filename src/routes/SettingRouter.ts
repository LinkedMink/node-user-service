import { createCrudRouter, filterByUserId } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim, authorizeUserOwned } from "../middleware/Authorization";
import { settingConverter } from "../models/converters/SettingConverter";
import { Setting } from "../models/database/Setting";

/**
 * @swagger
 * /Settings:
 *   get:
 *     description: Get the details of a specific Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *     responses:
 *       200:
 *         description: The retrieved list of Settings
 *       400:
 *         description: The supplied parameters are invalid
 *
 * @swagger
 * /Settings/{id}:
 *   get:
 *     description: Get the details of a specific Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The retrieved Settings
 *       404:
 *         description: The id doesn't match a Settings
 *
 * @swagger
 * /Settings:
 *   post:
 *     description: Save a new Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ISettingsModel'
 *     responses:
 *       200:
 *         description: The saved Settings
 *       400:
 *         description: The supplied Settings is invalid
 *
 * @swagger
 * /Settings/{id}:
 *   put:
 *     description: Update an existing Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ISettingsModel'
 *     responses:
 *       200:
 *         description: The updated Settings
 *       400:
 *         description: The supplied Settings is invalid
 *       404:
 *         description: The id doesn't match a Settings
 *
 * @swagger
 * /Settings/{id}:
 *   delete:
 *     description: Delete a specific Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The Settings was deleted
 *       404:
 *         description: The id doesn't match a Settings
 */
export const settingRouter = createCrudRouter(
    Setting,
    settingConverter,
    AuthorizationClaim.UserSettings,
    AuthorizationClaim.UserSettings,
    authorizeUserOwned,
    filterByUserId);
