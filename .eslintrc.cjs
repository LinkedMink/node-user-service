// @ts-check

/**
 * @type {import("eslint").ESLint.ConfigData}
 */
const config = {
  root: true,
  env: {
    node: true,
    es2023: true,
  },
  ignorePatterns: ["dist/**", "coverage/**"],
  overrides: [
    {
      files: ["*.{m,c,}ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      parserOptions: {
        project: ["tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "_" },
        ],
      },
    },
    {
      files: ["src/**/*.{m,c,}ts"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
      ],
      parserOptions: {
        project: ["src/tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "_" },
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
      files: ["tests/**/*.{m,c,}ts", "jest.config.ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tests/tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "_" },
        ],
      },
    },
    {
      files: ["*.{m,c,}js", "tests/**/*.{,m,c}js"],
      extends: ["eslint:recommended"],
    },
  ],
};

module.exports = config;
