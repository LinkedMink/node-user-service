import fs from "fs";
import swaggerJsDoc from "swagger-jsdoc";

import { config } from "../infastructure/Config";

export const SWAGGER_SPEC_FILE = "swagger.json"

export const generateSwaggerSpec = (): object => {
  const swaggerJsDocOptions: swaggerJsDoc.Options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: config.packageJson.name,
        version: config.packageJson.version,
        description: config.packageJson.description,
      },
    },
    apis: [
      "./docs/**/*.yaml",
      "./src/models/**/*.ts",
      "./src/routes/**/*.ts",
    ],
  };

  return swaggerJsDoc(swaggerJsDocOptions);
}

export const loadPreGeneratedSwaggerSpec = (): object => {
  const data = fs.readFileSync(SWAGGER_SPEC_FILE, "utf8");
  const swaggerSpec = JSON.parse(data);
  return swaggerSpec;
}
