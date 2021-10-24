module.exports = {
  overrides: [
    {
      files: ["src/**/*.ts"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.json"],
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "_" },
        ],
        "@typescript-eslint/restrict-template-expressions": "off",
      },
    },
    {
      files: ["tests/**/*.ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.test.json"],
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "_" },
        ],
        "@typescript-eslint/restrict-template-expressions": "off",
      },
    },
    {
      files: ["*.js"],
      parser: "espree",
    },
  ],
};
