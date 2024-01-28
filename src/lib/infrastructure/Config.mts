import dotenv from "dotenv";
import fs from "node:fs";
import { PackageJson } from "type-fest";
import { configDefaultMap, ConfigKey } from "./ConfigKey.mjs";

enum Environment {
  Local = "local",
  UnitTest = "test",
  Production = "production",
}

export class EnvironmentalConfig {
  private readonly fileBuffers = new Map<ConfigKey, Buffer>();
  private readonly jsonData = new Map<ConfigKey, unknown>();
  private readonly packageJsonValue: PackageJson;
  private readonly environment =
    (process.env.NODE_ENV?.toLowerCase() as Environment) ?? Environment.Local;

  constructor() {
    const dotEnvFile = `.env.${this.environment}`;
    if (fs.existsSync(dotEnvFile)) {
      dotenv.config({ path: dotEnvFile });
    }

    const filePath = "./package.json";
    const data = fs.readFileSync(filePath, "utf8");
    this.packageJsonValue = JSON.parse(data) as PackageJson;
  }

  public get isEnvironmentLocal(): boolean {
    return this.environment === Environment.Local;
  }

  public get isEnvironmentUnitTest(): boolean {
    return this.environment === Environment.UnitTest;
  }

  public get isEnvironmentProd(): boolean {
    return this.environment === Environment.Production;
  }

  public get isEnvironmentContainerized(): boolean {
    return process.env.IS_CONTAINER_ENV?.trim().toLowerCase() === "true";
  }

  public get packageJson(): PackageJson {
    return this.packageJsonValue;
  }

  public getString = (key: ConfigKey): string => {
    return this.getConfigValue(key);
  };

  public getNumber = (key: ConfigKey): number => {
    const value = this.getConfigValue(key);
    return Number(value);
  };

  public getBool = (key: ConfigKey): boolean => {
    const value = this.getConfigValue(key);
    return value.trim().toLowerCase() === "true";
  };

  // prettier-ignore
  public getJsonOrString = <T,>(key: ConfigKey): string | T => {
    const json = this.jsonData.get(key);
    if (json) {
      return json as string | T;
    }

    const value = this.getConfigValue(key).trim();
    if (value.length > 0 && (value.startsWith("{") || value.startsWith("["))) {
      return this.getJson<T>(key);
    }

    return value;
  };

  // prettier-ignore
  public getJson = <T,>(key: ConfigKey): T => {
    const json = this.jsonData.get(key);
    if (json) {
      return json as T;
    }

    const value = this.getConfigValue(key);
    const parsed = JSON.parse(value) as T;
    this.jsonData.set(key, parsed);
    return parsed;
  };

  public getFileBuffer = (key: ConfigKey): Buffer => {
    const buffer = this.fileBuffers.get(key);
    if (buffer) {
      return buffer;
    }

    if (process.env.NODE_ENV === Environment.UnitTest) {
      return Buffer.alloc(0);
    }

    const filePath = this.getConfigValue(key);
    const data = fs.readFileSync(filePath);
    this.fileBuffers.set(key, data);
    return data;
  };

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
  };
}

export const config = new EnvironmentalConfig();
