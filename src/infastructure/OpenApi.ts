import fs from "fs";
import { basename } from "path";
import swaggerJsDoc from "swagger-jsdoc";

import { config } from "./Config";
import { Logger } from "./Logger";

export const OPENAPI_DOCUMENT_PATH = "docs/OpenApi.json";

export const generateOpenApiDoc = (): Record<string, unknown> => {
  Logger.get(basename(__filename)).info("Generating OpenAPI document from source");

  return swaggerJsDoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: config.packageJson.name,
        description: config.packageJson.description,
        license: config.packageJson.license
          ? {
              name: config.packageJson.license,
              url: config.packageJson.repository.url
                ? `${config.packageJson.repository.url}/blob/master/LICENSE`
                : undefined,
            }
          : undefined,
        version: config.packageJson.version,
      },
    },
    apis: [
      "./docs/*.{yml,yaml}",
      "./src/models/{requests,responses}/*.{yml,yaml,ts}",
      "./src/routes/*.{yml,yaml,ts}",
    ],
  }) as Record<string, unknown>;
};

export const loadOpenApiDoc = async (
  filename = OPENAPI_DOCUMENT_PATH
): Promise<Record<string, unknown>> => {
  Logger.get(basename(__filename)).info(`Loading OpenAPI document: ${filename}`);
  if (!config.isEnvironmentLocal) {
    try {
      const data = await fs.promises.readFile(filename, "utf8");
      return JSON.parse(data) as Record<string, unknown>;
      // eslint-disable-next-line no-empty
    } catch {}
  }

  const doc = generateOpenApiDoc();
  await fs.promises.writeFile(OPENAPI_DOCUMENT_PATH, JSON.stringify(doc));
  return doc;
};
