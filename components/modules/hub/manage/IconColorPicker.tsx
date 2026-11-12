"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { TAG_CLASSES, TAG_COLOR_LABELS, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import { HUB_COLORS, HUB_ICON_KEYS, hubIcon } from "../shared";

/**
 * "Change icon" (CM06) and "Change icon and colour" (CM03): the icon set, then the package's eight tag colours,
 * each with its name — the colour is never the only signal.
 */
export const IconColorPicker: React.FC<{
  icon: string | null;
  color: string | null;
  onChange: (next: { icon: string; color: string }) => void;
}> = ({ icon, color, onChange }) => {
  const t = useTranslations("hub");
  const tCommon = useTranslations("common");
  const currentIcon = icon ?? "file";
  const currentColor = toTagColor(color);
  return (
    <div className="flex w-[300px] flex-col gap-3">
      <p className="text-label text-secondary">{t("manage.icon")}</p>
      <div role="radiogroup" aria-label={t("manage.icon")} className="grid grid-cols-5 gap-1.5">
        {HUB_ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={key === currentIcon}
            aria-label={t(`manage.icons.${key}`)}
            onClick={() => onChange({ icon: key, color: currentColor })}
            className={cn(
              "flex size-10 items-center justify-center rounded-tint",
              TAG_CLASSES[currentColor].chip,
              key === currentIcon ? "ring-2 ring-accent ring-offset-1" : "hover:ring-1 hover:ring-strong",
            )}
          >
            <Icon icon={hubIcon(key)} size="md" />
          </button>
        ))}
      </div>
      <p className="text-label text-secondary">{t("manage.colour")}</p>
      <div role="radiogroup" aria-label={t("manage.colour")} className="flex flex-wrap gap-2">
        {HUB_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === currentColor}
            onClick={() => onChange({ icon: currentIcon, color: c })}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-tag px-2.5 text-hint font-medium",
              TAG_CLASSES[c].chip,
              c === currentColor ? "ring-2 ring-accent ring-offset-1" : "hover:ring-1 hover:ring-strong",
            )}
          >
            {c === currentColor ? <Icon icon={Tick02Icon} size="sm" className="size-3.5" /> : <span aria-hidden className={cn("size-1.5 rounded-pill", TAG_CLASSES[c].dot)} />}
            {tCommon(TAG_COLOR_LABELS[c])}
          </button>
        ))}
      </div>
    </div>
  );
};
