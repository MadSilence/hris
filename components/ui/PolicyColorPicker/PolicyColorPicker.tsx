"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { POLICY_COLORS, TAG_COLOR_LABELS, type TagColor } from "@/lib/theme/tags";
import { LEAVE_CLASSES } from "@/lib/theme/leave";

const PER_ROW = 6;

/** The picked circle's ring, in the colour's edge — written out so Tailwind finds each class. */
const RING: Record<TagColor, string> = {
  gray: "ring-leave-gray-edge", berry: "ring-leave-berry-edge", plum: "ring-leave-plum-edge", lilac: "ring-leave-lilac-edge",
  indigo: "ring-leave-indigo-edge", ocean: "ring-leave-ocean-edge", teal: "ring-leave-teal-edge", olive: "ring-leave-olive-edge",
  mustard: "ring-leave-mustard-edge", bronze: "ring-leave-bronze-edge", orange: "ring-leave-orange-edge", cocoa: "ring-leave-cocoa-edge",
};

/**
 * Picking a time off policy's colour (the designers' answer 2.4, `DESIGN_SYSTEM.md` § 7): eleven 32 px circles in K01's
 * order, each the policy marker drawn large — the leave fill with a 16 px dot of its edge — gray is not offered, gray is
 * "Away" — six to a row on 48 px columns, 8 × 12 apart. The picked one carries a 16 px tick in the colour's text tone in
 * place of the dot and a 2 px ring of its edge with a 2 px gap; never the accent. A colour another
 * policy uses says "In use" under it and "Used by …" on hover, and may still be picked. A radio group: the arrow keys
 * move the choice (up and down by a row), Tab leaves it.
 */
export const PolicyColorPicker: React.FC<{
  value: TagColor;
  onChange: (color: TagColor) => void;
  /** Colour → the names of the other policies wearing it. */
  usedBy?: Partial<Record<TagColor, string[]>>;
  disabled?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}> = ({ value, onChange, usedBy = {}, disabled, id, "aria-labelledby": labelledBy }) => {
  const t = useTranslations("common");
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, POLICY_COLORS.indexOf(value));
  // The "In use" line is reserved under every circle once any colour is taken, so the rows stay even.
  const anyUsed = Object.values(usedBy).some((names) => names && names.length > 0);

  const move = (event: React.KeyboardEvent, from: number) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: PER_ROW, ArrowUp: -PER_ROW }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = Math.min(POLICY_COLORS.length - 1, Math.max(0, from + step));
    onChange(POLICY_COLORS[next]);
    refs.current[next]?.focus();
  };

  return (
    <div id={id} role="radiogroup" aria-labelledby={labelledBy} className="grid w-fit grid-cols-6 gap-x-2 gap-y-3">
      {POLICY_COLORS.map((color, i) => {
        const selected = i === index;
        const users = usedBy[color] ?? [];
        const name = t(TAG_COLOR_LABELS[color]);
        const circle = (
          <button
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={users.length ? `${name}, ${t("tagColor.usedBy", { names: users.join(", ") })}` : name}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(color)}
            onKeyDown={(e) => move(e, i)}
            className={cn(
              "grid size-8 place-items-center rounded-pill transition-shadow duration-(--duration-hover)",
              LEAVE_CLASSES[color].fill,
              selected && cn("ring-2 ring-offset-2 ring-offset-card", RING[color]),
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {selected ? (
              <Icon icon={Tick02Icon} size="sm" className={cn("size-4", LEAVE_CLASSES[color].text)} />
            ) : (
              <span aria-hidden className={cn("size-4 rounded-pill", LEAVE_CLASSES[color].edge)} />
            )}
          </button>
        );
        return (
          <div key={color} className="flex w-12 flex-col items-center gap-1">
            {users.length ? (
              <Tooltip>
                <TooltipTrigger asChild>{circle}</TooltipTrigger>
                <TooltipContent>{t("tagColor.usedBy", { names: users.join(", ") })}</TooltipContent>
              </Tooltip>
            ) : (
              circle
            )}
            {anyUsed ? (
              <span aria-hidden className={cn("text-hint text-tertiary", !users.length && "invisible")}>
                {t("tagColor.inUse")}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
