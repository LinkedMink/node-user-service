// @ts-check

import eslint from "@eslint/js";
// import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["**/*.ts", "**/*.mts"],
    extends: [eslint.configs.recommended, ...tsEslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        project: ["tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: false,
          allowNullish: true,
          allowRegExp: false,
        },
      ],
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.mts"],
    extends: [...tsEslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ["src/tsconfig.json"],
      },
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["tests/tsconfig.json"],
      },
    },
  }
);
