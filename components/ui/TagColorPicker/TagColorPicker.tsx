"use client";

import * as React from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { TAG_CLASSES, TAG_COLOR_LABELS, TAG_COLORS, toTagColor, type TagColor } from "@/lib/theme/tags";

/*
 * Picking a tag colour (SPEC § 4.7): the eight colours of the tag palette, each shown as the chip it will
 * become, with its name — the colour is never the only signal, so a person picking it reads it too. There
 * is no custom colour: the palette is what keeps tags apart from statuses and from the workspace accent.
 */
export const TagColorSwatches: React.FC<{
  value: string | null | undefined;
  onChange: (color: TagColor) => void;
  disabled?: boolean;
  "aria-label"?: string;
}> = ({ value, onChange, disabled, "aria-label": ariaLabel = "Color" }) => {
  const current = toTagColor(value);
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {TAG_COLORS.map((color) => {
        const selected = current === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-tag px-2.5 text-hint font-medium transition-shadow duration-(--duration-hover)",
              TAG_CLASSES[color].chip,
              selected ? "ring-2 ring-accent ring-offset-1" : "hover:ring-1 hover:ring-strong",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {selected ? (
              <Icon icon={Tick02Icon} size="sm" className="size-3.5" />
            ) : (
              <span aria-hidden className={cn("size-1.5 rounded-pill", TAG_CLASSES[color].dot)} />
            )}
            {TAG_COLOR_LABELS[color]}
          </button>
        );
      })}
    </div>
  );
};

/**
 * The compact control beside a list option: its colour's dot, opening the swatches in a dialog. A dialog
 * rather than a popover: it renders in a portal, so the option list's scroll container cannot clip it.
 */
export const TagColorPicker: React.FC<{
  value: string | null | undefined;
  onChange: (color: TagColor) => void;
  /** Names the option: "Color of remote". */
  ariaLabel: string;
  disabled?: boolean;
}> = ({ value, onChange, ariaLabel, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const current = toTagColor(value);

  return (
    <>
      <button
        type="button"
        className="grid size-8 shrink-0 place-items-center rounded-control transition-colors duration-(--duration-hover) hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setOpen(true)}
        aria-label={`${ariaLabel}: ${TAG_COLOR_LABELS[current]}`}
        title={TAG_COLOR_LABELS[current]}
        disabled={disabled}
      >
        <span aria-hidden className={cn("size-4 rounded-pill", TAG_CLASSES[current].bar)} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Pick a color</DialogTitle>
            <DialogDescription>Used for this option&apos;s tag.</DialogDescription>
          </DialogHeader>

          <TagColorSwatches
            value={current}
            onChange={(color) => {
              onChange(color);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
