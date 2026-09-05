import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["node_modules/", "coverage/", "main.js"]),
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.mts",
            "esbuild.config.mjs",
            "scripts/*.cjs",
            "vitest.config.mts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["*.config.{mts,ts,mjs}", "scripts/**/*.cjs"],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-restricted-globals": "off",
      "obsidianmd/no-nodejs-modules": "off",
      "obsidianmd/prefer-window-timers": "off",
      "obsidianmd/rule-custom-message": "off",
    },
  },
  {
    rules: {
      "obsidianmd/settings-tab/prefer-setting-definitions": "off"
    },
  },
);
