// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier";

import { fileURLToPath } from "url";
import { dirname } from "path";

export default tseslint.config({
  files: ["src/**/*.ts"],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],
  plugins: { prettier: eslintPluginPrettierRecommended },
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
    },
  },
});
