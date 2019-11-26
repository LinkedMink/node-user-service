import dotenv from "dotenv";
import fs from "fs";

export enum ConfigKey {
  AllowedOrigins = "ALLOWED_ORIGINS",
  JwtAudience = "JWT_AUDIENCE",
  JwtExpirationSecords = "JWT_EXPIRATION_SECORDS",
  JwtIssuer = "JWT_ISSUER",
  JwtSecretKeyFile = "JWT_SECRET_KEY_FILE",
  ListenPort = "LISTEN_PORT",
  LogFile = "LOG_FILE",
  LogLevel = "LOG_LEVEL",
  MongoDbConnectionString = "MONGO_DB_CONNECTION_STRING",
}

const configDefaultMap: Map<ConfigKey, string | undefined> = new Map([
  [ConfigKey.AllowedOrigins, "*"],
  [ConfigKey.JwtExpirationSecords, String(30 * 24 * 60 * 60)],
  [ConfigKey.ListenPort, "8080"],
  [ConfigKey.LogFile, "combined.log"],
  [ConfigKey.LogLevel, "info"],
]);

export const isEnvironmentLocal = !process.env.NODE_ENV || process.env.NODE_ENV === "local";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
}

export const getConfigValue = (key: ConfigKey): string => {
  let configValue = process.env[key];
  if (configValue) {
    return configValue;
  }

  configValue = configDefaultMap.get(key);
  if (configValue) {
    return configValue;
  }

  throw new Error(`Environmental variable must be defined: ${key}`);
};

const loadPackageJson = () => {
  // const filePath = isEnvironmentLocal ? "../package.json" : "./package.json";
  const filePath = "./package.json";
  const data = fs.readFileSync(filePath, "utf8");
  const properties = JSON.parse(data);

  return properties;
};

const loadSecretKeyFile = (): Buffer => {
  if (process.env.NODE_ENV === "test") {
    return Buffer.alloc(0);
  }

  const filePath = getConfigValue(ConfigKey.JwtSecretKeyFile);
  return fs.readFileSync(filePath);
};

export const packageJson = loadPackageJson();
export const jwtSecretKey = loadSecretKeyFile();
