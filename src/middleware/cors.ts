import cors from "cors";

import { ConfigKey, getConfigValue } from "../infastructure/config";

export const CORS_ERROR = "Not allowed by CORS";

const loadAllowedOrigins = () => {
  const config = getConfigValue(ConfigKey.AllowedOrigins).trim();
  if (config[0] === "[") {
    return JSON.parse(config);
  }

  return config;
};

const originsData = loadAllowedOrigins();
let originsFunc = originsData;
if (originsData.length) {
  originsFunc = (origin: string, callback: any) => {
    if (originsData.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(CORS_ERROR));
    }
  };
}

export const corsMiddleware = cors({
  origin: originsFunc,
  optionsSuccessStatus: 200,
});
