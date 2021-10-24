import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  verbose: true,
  setupFilesAfterEnv: ["./tests/setup.ts"],
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx", "node"],
  testMatch: ["**/tests/**/(*.test|*.spec).ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/!(*.spec|*.test|*.enum|app|logger|config).ts"],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75,
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
};

export default config;
