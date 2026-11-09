import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RAW_HUE =
  "/(^|[\\s:])(bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|placeholder|accent|caret|shadow)(-[a-z]+)?-(brown|gray|slate|zinc|neutral|stone|red|rose|pink|fuchsia|purple|violet|indigo|green|emerald|lime|amber|yellow|orange|blue|sky|cyan|teal|success|danger|warning|info)-[0-9]/";
const RAW_HUE_MESSAGE =
  "Use a role of the noddo design system (text-secondary, bg-subtle, bg-accent, bg-status-approved-bg, a tag colour…) instead of a palette step — styles/globals.css lists them.";

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
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // The codebase already marks a deliberately-unused binding with a leading underscore —
      // route handlers that ignore `req`, destructures that drop audit columns. Honour that
      // convention so the rule reports only the genuinely leftover ones.
      // Raised to error when there were no findings, so the move was free and dead imports stop
      // accumulating silently.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Every colour is a role of the noddo design system (`styles/globals.css`): text, surface, border,
      // accent, status, tag. A palette step — `brown-50`, `blue-700`, `success-600` — produces no CSS at
      // all since Tailwind's palette was switched off, so this rule says so in the editor;
      // `test/designSystemGuard.test.ts` says it for everything else. A category takes the tag palette.
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${RAW_HUE}]`,
          message: RAW_HUE_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${RAW_HUE}]`,
          message: RAW_HUE_MESSAGE,
        },
        // A button with no `type` is a submit button inside any form it ends up in, and Desact's
        // Button sets no default. It swallowed a step of the welcome once (NEED_TO_DISCUSS § 20); the
        // owner chose this rule over changing the kit (2026-10-27). `react/button-has-type` sees only
        // the native element, so the selector covers `<Button>` too. `asChild` renders its child's tag.
        {
          selector:
            "JSXOpeningElement[name.name=/^(Button|button)$/]:not(:has(JSXAttribute[name.name='type'])):not(:has(JSXAttribute[name.name='asChild']))",
          message: 'Give the button a type: type="button", or type="submit" for the one that submits its form.',
        },
      ],
    },
  },
];

export default eslintConfig;
