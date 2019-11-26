import { Router } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { packageJson } from "../infastructure/config";

export const swaggerRouter = Router();

const swaggerUiOptions: SwaggerUiOptions = {
  isExplorer: true,
};

const swaggerJsDocOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    },
  },
  apis: [
    "./src/models/*.ts",
    "./src/routes/*.ts",
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerJsDocOptions);

swaggerRouter.use("/", swaggerUi.serve);
swaggerRouter.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
