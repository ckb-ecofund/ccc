// @ts-check

import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

import { dirname } from "path";
import { fileURLToPath } from "url";

export default tseslint.config({
  files: ["./src/**/*.ts"],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],
  rules: {
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
  },
  plugins: { prettier: eslintPluginPrettierRecommended },
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
    },
  },
});
