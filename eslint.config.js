import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

const commonNodeFiles = [
  "backend/**/*.js",
  "packages/**/*.js",
  "proxy/**/*.js",
  "*.js"
];

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "docs/**",
      "marketplace_agents_docs_bundle.md"
    ]
  },
  js.configs.recommended,
  {
    files: commonNodeFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    }
  },
  {
    files: ["frontend/**/*.js"],
    plugins: {
      react: reactPlugin
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "react/jsx-uses-vars": "error"
    }
  }
];
