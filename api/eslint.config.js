import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    ignores: ["dist"], // 無視するファイル・ディレクトリ
  },
  {
    files: ["**/*.ts"], // 適用するファイルのglob
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "false",
    },
  },

  {
    files: ["**/*.js"], // js 用の設定を分けたい
    languageOptions: {
      sourceType: "module",
    },
    extends: [js.configs.recommended],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
]);
