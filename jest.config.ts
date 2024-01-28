import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "@shelf/jest-mongodb",
  verbose: true,
  // setupFilesAfterEnv: ["<rootDir>/tests/SetupAfterEnv.ts"],
  resolver: "<rootDir>/tests/JestMjsResolver.cjs",
  extensionsToTreatAsEsm: [".ts", ".mts"],
  moduleFileExtensions: ["js", "jsx", "mjs", "cjs", "json", "ts", "tsx", "mts", "cts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/(*.test|*.spec).{m,c,}ts"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/!(*.spec|*.test|*.enum|app|logger|config).{m,c,}ts"],
  // coverageThreshold: {
  //   global: {
  //     statements: 75,
  //     branches: 75,
  //     functions: 75,
  //     lines: 75,
  //   },
  // },
  coverageProvider: "v8",
  transform: {
    "^.+\\.m?tsx?$": [
      "ts-jest",
      {
        tsconfig: "tests/tsconfig.json",
        useESM: true,
      },
    ],
  },
};

export default config;
