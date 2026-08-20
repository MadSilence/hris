import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      // Build output. `next.config.ts` sets distDir to `.next-dev`, so the default `.next` entry
      // never matched and `npm run lint` was linting ~2800 findings out of generated code.
      ".next/**",
      ".next-dev/**",
      "out/**",
      "build/**",
      "coverage/**",
      // Vendored Desact UI kit and its component gallery — excluded from tsconfig for the same
      // reason. We consume its components; we do not hold its source to this project's rules.
      "public/desact/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // The codebase already marks a deliberately-unused binding with a leading underscore —
      // route handlers that ignore `req`, destructures that drop audit columns. Honour that
      // convention so the rule reports only the genuinely leftover ones.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
