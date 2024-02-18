import fs from "node:fs/promises";
import { config } from "./Config.mjs";
import { Logger } from "./Logger.mjs";
import { isString } from "./TypeCheck.mjs";

export const OPENAPI_DOCUMENT_PATH = "docs/OpenApi.json";

export const generateOpenApiDoc = async (): Promise<Record<string, unknown>> => {
  Logger.fromModuleUrl(import.meta.url).info("Generating OpenAPI document from source");

  const repoUrl = isString(config.packageJson.repository)
    ? config.packageJson.repository
    : config.packageJson.repository?.url;

  const swaggerJsDoc = (await import("swagger-jsdoc")).default;
  return swaggerJsDoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: config.packageJson.name as string,
        description: config.packageJson.description,
        license: config.packageJson.license
          ? {
              name: config.packageJson.license,
              url: repoUrl ? `${repoUrl}/blob/master/LICENSE` : undefined,
            }
          : undefined,
        version: config.packageJson.version as string,
      },
    },
    apis: [
      "./docs/*.{yml,yaml}",
      "./src/lib/models/{requests,responses}/*.yaml",
      "./src/lib/routes/*.yaml",
    ],
  }) as Record<string, unknown>;
};

export const loadOpenApiDoc = async (
  filename = OPENAPI_DOCUMENT_PATH
): Promise<Record<string, unknown>> => {
  Logger.fromModuleUrl(import.meta.url).info(`Loading OpenAPI document: ${filename}`);
  if (!config.isEnvironmentDevelopment) {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data) as Record<string, unknown>;
  }

  const doc = generateOpenApiDoc();
  await fs.writeFile(OPENAPI_DOCUMENT_PATH, JSON.stringify(doc));
  return doc;
};
