import dotenv from "dotenv";
import fs from "fs";

export enum Environment {
  // localhost
  Local = "local",
  Test = "test",                // Unit Test process
  // Standalone servers
  Development = "development",
  Production = "production",
}

export enum ConfigKey {
  AppName = "APP_NAME",
  ServiceBaseUrl = "SERVICE_BASE_URL",
  AllowedOrigins = "ALLOWED_ORIGINS",
  JwtAudience = "JWT_AUDIENCE",
  JwtExpirationDays = "JWT_EXPIRATION_DAYS",
  JwtIssuer = "JWT_ISSUER",
  JwtSecretKeyFile = "JWT_SECRET_KEY_FILE",
  JwtSigningAlgorithm = "JWT_SIGNING_ALGORITHM",
  ListenPort = "LISTEN_PORT",
  LogFile = "LOG_FILE",
  LogLevel = "LOG_LEVEL",
  MongoDbConnectionString = "MONGO_DB_CONNECTION_STRING",

  UserRegistrationIsEnabled = "USER_REGISTRATION_IS_ENABLED",
  UserDefaultClaims = "USER_DEFAULT_CLAIMS",
  UserPassHashCostFactor = "USER_PASS_HASH_COST_FACTOR",
  UserPassMinLength = "USER_PASS_MIN_LENGTH",
  UserPassMaxAttempts = "USER_PASS_MAX_ATTEMPTS",
  UserLockoutMinutes = "USER_LOCKOUT_MINUTES",
  UserTemporaryKeyMinutes = "USER_TEMPORARY_KEY_MINUTES",

  SystemEmailAddress = "SYSTEM_EMAIL_ADDRESS",
  NodeMailerTransport = "NODE_MAILER_TRANSPORT",
  PasswordResetUiUrl = "PASSWORD_RESET_UI_URL",
}

const configDefaultMap: Map<ConfigKey, string | undefined> = new Map([
  [ConfigKey.AppName, "LinkedMink"],
  [ConfigKey.ServiceBaseUrl, "http://localhost:8080"],
  [ConfigKey.AllowedOrigins, "*"],
  [ConfigKey.JwtExpirationDays, String(30)],
  [ConfigKey.JwtSigningAlgorithm, "RS256"],
  [ConfigKey.ListenPort, "8080"],
  [ConfigKey.LogFile, "combined.log"],
  [ConfigKey.LogLevel, "info"],

  [ConfigKey.UserRegistrationIsEnabled, "true"],
  [ConfigKey.UserDefaultClaims, ""],
  [ConfigKey.UserPassHashCostFactor, String(10)],
  [ConfigKey.UserPassMinLength, String(8)],
  [ConfigKey.UserPassMaxAttempts, String(5)],
  [ConfigKey.UserLockoutMinutes, String(5)],
  [ConfigKey.UserTemporaryKeyMinutes, String(120)],

  [ConfigKey.SystemEmailAddress, "noreply@linkedmink.space"],
  [ConfigKey.NodeMailerTransport, ""],
  [ConfigKey.PasswordResetUiUrl, "http://localhost/passwordReset"],
]);

if (process.env.NODE_ENV === Environment.Test) {
  dotenv.config({ path: ".env.test" });
}

export class EnvironmentalConfig {
  private fileBuffers: Map<ConfigKey, Buffer> = new Map();
  private jsonObjects: Map<ConfigKey, { [key: string]: any }> = new Map();
  private isEnvironmentLocalValue: boolean =
    !process.env.NODE_ENV || process.env.NODE_ENV === Environment.Local;
  private packageJsonValue: { [key: string]: any };

  constructor() {
    // const filePath = isEnvironmentLocal ? "../package.json" : "./package.json";
    const filePath = "./package.json";
    const data = fs.readFileSync(filePath, "utf8");
    this.packageJsonValue = JSON.parse(data);
  }

  public get isEnvironmentLocal(): boolean {
    return this.isEnvironmentLocalValue;
  }

  public get packageJson(): { [key: string]: any } {
    return this.packageJsonValue;
  }

  public getString = (key: ConfigKey) => {
    return this.getConfigValue(key);
  }

  public getNumber = (key: ConfigKey) => {
    const value = this.getConfigValue(key);
    return Number(value);
  }

  public getBool = (key: ConfigKey) => {
    const value = this.getConfigValue(key);
    return value.trim().toLowerCase() === "true";
  }

  public getJsonOrString = (key: ConfigKey) => {
    const json = this.jsonObjects.get(key);
    if (json) {
      return json;
    }

    const value = this.getConfigValue(key).trim();
    if (value.length > 0 && (value.startsWith("{") || value.startsWith("["))) {
      return this.getJson(key);
    }

    return value;
  }

  public getJson = (key: ConfigKey) => {
    const json = this.jsonObjects.get(key);
    if (json) {
      return json;
    }

    const value = this.getConfigValue(key);
    const parsed = JSON.parse(value) as { [key: string]: any };
    this.jsonObjects.set(key, parsed);
    return parsed;
  }

  public getFileBuffer = (key: ConfigKey) => {
    const buffer = this.fileBuffers.get(key);
    if (buffer) {
      return buffer;
    }

    if (process.env.NODE_ENV === Environment.Test) {
      return Buffer.alloc(0);
    }

    const filePath = this.getConfigValue(key);
    const data = fs.readFileSync(filePath);
    this.fileBuffers.set(key, data);
    return data;
  }

  private getConfigValue = (key: ConfigKey): string => {
    let configValue = process.env[key];
    if (configValue) {
      return configValue;
    }

    configValue = configDefaultMap.get(key);
    if (configValue !== undefined) {
      return configValue;
    }

    throw new Error(`Environmental variable must be defined: ${key}`);
  }
}

export const config = new EnvironmentalConfig();
