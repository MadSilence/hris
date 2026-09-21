import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RAW_STATUS_HUE =
  "/(^|[\\s:])(bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|placeholder|accent|caret|shadow)(-[a-z]+)?-(red|rose|green|emerald|lime|amber|yellow|orange|blue|sky|teal)-[0-9]/";
const RAW_STATUS_HUE_MESSAGE =
  "Use a semantic colour token (success-*, danger-*, warning-*, info-*) instead of a raw Tailwind hue — ui/STATUS_AND_BADGES.md § 3.";

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
      // Поднято до error клинапом 2026-08-25: на тот момент находок было ноль, значит переход
      // бесплатный, а мёртвые импорты больше не накапливаются молча.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // A status colour is a semantic token — `success-*`, `danger-*`, `warning-*`, `info-*` —
      // never a raw Tailwind hue (`technical_documentation/ui/STATUS_AND_BADGES.md` § 3). The
      // scales are exact copies of green/red/amber/blue, so the conversion of 2026-09-21 moved
      // no pixel; this rule is what keeps the raw hues from growing back. A categorical palette
      // (a chip per field type) is not a status and says so with an eslint-disable comment.
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${RAW_STATUS_HUE}]`,
          message: RAW_STATUS_HUE_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${RAW_STATUS_HUE}]`,
          message: RAW_STATUS_HUE_MESSAGE,
        },
      ],
    },
  },
];

export default eslintConfig;
