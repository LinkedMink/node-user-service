import cors, { CorsOptions } from "cors";
import { config } from "../infrastructure/Config.mjs";
import { ConfigKey } from "../infrastructure/ConfigKey.mjs";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age#delta-seconds
 */
const ALLOW_PREFLIGHT_MAX_AGE = 86400;

export const corsMiddleware = () => {
  const corsOptions: CorsOptions = {
    origin: config.getJsonOrString<string[]>(ConfigKey.AllowedOrigins),
    maxAge: ALLOW_PREFLIGHT_MAX_AGE,
  };

  return cors(corsOptions);
};
