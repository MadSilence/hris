import type { AppLocale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";

/**
 * Types `t()` with the English catalogue (I18N.md § 7.2): a key that is not in `messages/en/` does not
 * compile. `test/i18nTypedKeys.typecheck.ts` holds a deliberately wrong key under `@ts-expect-error`, so a
 * typing that silently stopped working fails `npm run typecheck`.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: Messages;
  }
}
