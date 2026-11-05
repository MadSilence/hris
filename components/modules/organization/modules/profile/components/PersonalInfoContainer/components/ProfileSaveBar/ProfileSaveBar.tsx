import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";

type Props = {
  /** How many fields differ from what was loaded. The bar is not drawn at zero. */
  changeCount: number;
  isSaving: boolean;
  /** A client-side problem in a field (reported beside that field) — Save waits for it. */
  saveBlocked?: boolean;
  /** What the server said when the save was refused. The draft stays, so it can be fixed. */
  error?: string | null;
  onDiscard: () => void;
  onSave: () => void;
};

/**
 * "3 unsaved changes · Discard · Save" — the profile's one Save (owner's decision, 2026-09-14,
 * person-profile plan 9.3).
 *
 * It sticks to the bottom of the profile's scroll area and appears as soon as something changed, so
 * Save is where the reader is rather than above a form they have scrolled past — the problem the
 * page-wide Edit had — and one Save writes every open block, in one request.
 */
export const ProfileSaveBar: React.FC<Props> = ({
  changeCount,
  isSaving,
  saveBlocked = false,
  error,
  onDiscard,
  onSave,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  if (changeCount === 0 && !error) return null;

  return (
    <div
      role="region"
      aria-label={t("profile.saveBar.region")}
      className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-control border border-divider bg-page px-4 py-3 shadow-raised"
    >
      <span className="text-body font-medium text-primary">{t("profile.saveBar.count", { count: changeCount })}</span>

      <div className="flex min-w-0 items-center gap-2">
        {error && (
          <span role="alert" className="truncate text-body text-danger-text">
            {error}
          </span>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onDiscard} disabled={isSaving}>
          {tCommon("actions.discard")}
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={isSaving || saveBlocked || changeCount === 0}>
          {isSaving ? tCommon("actions.saving") : tCommon("actions.save")}
        </Button>
      </div>
    </div>
  );
};
