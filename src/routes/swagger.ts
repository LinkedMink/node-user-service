import { Router } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { config } from "../infastructure/config";

export const swaggerRouter = Router();

const swaggerUiOptions: SwaggerUiOptions = {
  isExplorer: true,
};

const swaggerJsDocOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: config.packageJson.name,
      version: config.packageJson.version,
      description: config.packageJson.description,
    },
  },
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      scheme: "bearer",
      in: "header",
    },
  },
  apis: [
    "./src/models/*.ts",
    "./src/models/requests/*.ts",
    "./src/routes/*.ts",
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerJsDocOptions);

swaggerRouter.use("/", swaggerUi.serve);
swaggerRouter.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
