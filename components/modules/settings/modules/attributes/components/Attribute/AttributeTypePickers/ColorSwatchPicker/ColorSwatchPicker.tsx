"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { PRESET_COLORS } from "@/models/colors";
import { cn } from "@/lib/cn";

type ColorSwatchPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  ariaLabel: string;
  disabled?: boolean;
};

/**
 * Per-option colour control: a small round swatch that opens the palette in its own dialog.
 *
 * It used to drop a popover directly under the swatch, which the option list's scroll container
 * clipped as soon as there were more than a few options. A dialog renders in a portal, so it can't
 * be cut off by whatever the picker happens to sit inside.
 */
export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  value,
  onChange,
  ariaLabel,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);

  const select = (hex: string) => {
    onChange(hex);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="h-6 w-6 shrink-0 rounded-full border border-brown-200 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: value }}
        onClick={() => !disabled && setOpen(true)}
        aria-label={ariaLabel}
        disabled={disabled}
        title={value}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Pick a colour</DialogTitle>
            <DialogDescription>Used for this option&apos;s badge.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2" role="listbox" aria-label="Color palette">
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                className={cn(
                  "h-8 w-8 rounded-full border transition-transform hover:scale-105",
                  hex.toLowerCase() === value.toLowerCase()
                    ? "ring-2 ring-brown-400 ring-offset-2"
                    : "border-brown-200",
                )}
                style={{ backgroundColor: hex }}
                onClick={() => select(hex)}
                aria-label={`Choose ${hex}`}
                title={hex}
              />
            ))}
          </div>

          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brown-300 px-3 text-sm text-brown-600 hover:bg-brown-50">
            <span
              className="h-4 w-4 rounded-full border border-brown-200"
              style={{ backgroundColor: value }}
            />
            Custom colour
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              className="sr-only"
            />
          </label>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ColorSwatchPicker;
