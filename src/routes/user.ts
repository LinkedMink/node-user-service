import { createCrudRouter } from "../infastructure/createCrudRouter";
import { AuthorizationClaim } from "../middleware/authorization";
import { UserConverter } from "../models/converters/userConverter";
import { User } from "../models/database/user";

/**
 * @swagger
 * /User:
 *   get:
 *     description: Get the details of a specific User
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *     responses:
 *       200:
 *         description: The retrieved list of User
 *       400:
 *         description: The supplied parameters are invalid
 *
 * @swagger
 * /User/{id}:
 *   get:
 *     description: Get the details of a specific User
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The retrieved User
 *       404:
 *         description: The id doesn't match a User
 *
 * @swagger
 * /User:
 *   post:
 *     description: Save a new User
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/IUserModel'
 *     responses:
 *       200:
 *         description: The saved User
 *       400:
 *         description: The supplied User is invalid
 *
 * @swagger
 * /User/{id}:
 *   put:
 *     description: Update an existing User
 *     tags: [User]
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
 *           $ref: '#/definitions/IUserModel'
 *     responses:
 *       200:
 *         description: The updated User
 *       400:
 *         description: The supplied User is invalid
 *       404:
 *         description: The id doesn't match a User
 *
 * @swagger
 * /User/{id}:
 *   delete:
 *     description: Delete a specific User
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The User was deleted
 *       404:
 *         description: The id doesn't match a User
 */
export const userRouter = createCrudRouter(
    AuthorizationClaim.UserManage,
    User,
    new UserConverter());
