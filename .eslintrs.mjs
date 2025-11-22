module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import",
    "simple-import-sort",
    "prettier",
    "testing-library",
    "jest-dom",
  ],
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript"
  ],
  rules: {
    "prettier/prettier": "error",
    "no-console": "warn",

    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    "import/order": "off",
    "import/default": "off",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          [
            "^\\u0000",
            "^react(.*)?$",
            "^(?!src\\/)?@?\\w",
            "^(?!public\\/)?@?\\w",
          ],
          ["^src/", "^public/"],
          ["^\\."],
        ]
      }
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    ".next",
    "node_modules",
    "dist",
    "coverage",
    "*.config.js",
    "*.config.cjs",
    "*.config.ts",
  ],
};
