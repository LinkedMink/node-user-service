import fs from "fs";

import { config } from "../infastructure/Config";

export const DEFAULT_SWAGGER_DOC_FILE = "swagger.json";

export const generateSwaggerDoc = async (): Promise<Record<string, unknown>> => {
  const swaggerJsDoc = await import("swagger-jsdoc");

  return swaggerJsDoc.default({
    definition: {
      openapi: "3.0.3",
      info: {
        title: config.packageJson.name,
        version: config.packageJson.version,
        description: config.packageJson.description,
      },
    },
    apis: ["./docs/**/*.yaml", "./src/models/**/*.ts", "./src/routes/**/*.ts"],
  }) as Record<string, unknown>;
};

export const loadSwaggerDocFile = async (
  filename = DEFAULT_SWAGGER_DOC_FILE
): Promise<Record<string, unknown>> => {
  const data = await fs.promises.readFile(filename, "utf8");
  const swaggerSpec = JSON.parse(data) as Record<string, unknown>;
  return swaggerSpec;
};

export const getRuntimeSwaggerDoc = async (): Promise<Record<string, unknown>> =>
  config.isEnvironmentLocal ? Promise.resolve(generateSwaggerDoc()) : await loadSwaggerDocFile();
