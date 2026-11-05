/**
 * Proves the typed keys still bite (I18N.md § 7.2). Never run — only compiled by `npm run typecheck`.
 *
 * `useTranslations` and `getTranslations` take their types from `AppConfig` in `global.d.ts`, nowhere else.
 * If that augmentation stopped applying, every key would be accepted and the `@ts-expect-error` lines below
 * would have nothing to expect: tsc then fails with "Unused '@ts-expect-error' directive". A check that cannot
 * fail is not a check (`toolchain-traps`) — this one was proven by removing `global.d.ts`.
 */
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export function useTypedKeysProbe(): string[] {
  const t = useTranslations("common");
  return [
    t("actions.save"),
    // @ts-expect-error — not a key of messages/en/common.json
    t("actions.thisKeyDoesNotExist"),
  ];
}

export async function typedKeysProbeOnTheServer(): Promise<string> {
  // @ts-expect-error — a namespace that does not exist
  await getTranslations("noSuchNamespace");
  const t = await getTranslations("common");
  return t("values.yes");
}
