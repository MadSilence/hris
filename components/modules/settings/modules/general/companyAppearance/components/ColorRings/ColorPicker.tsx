"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import {
  clamp01,
  hexToHsv,
  hsvToHex,
  parseColorCode,
  type Hsv,
} from "@/components/modules/settings/modules/general/companyAppearance/appearanceDraft";

type Props = {
  /** The last good colour, lowercase `#rrggbb`. */
  value: string;
  /** A valid colour, from the square, the hue bar or a whole code. */
  onChange: (hex: string) => void;
  /** Whether what is typed in the code field is not a colour (Save then says so here). */
  onInvalidChange: (invalid: boolean) => void;
  invalid: boolean;
};

/** Drags a pointer over an element and reports where it is, 0–1 on each axis. */
const useDrag = (onMove: (x: number, y: number) => void) => {
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onMove(clamp01((event.clientX - box.left) / box.width), clamp01((event.clientY - box.top) / box.height));
  };
  return {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      move(event);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.buttons === 1) move(event);
    },
  };
};

/**
 * "Your own" (sign-in-appearance § Layout, L3): a saturation/brightness square 150 high, a hue bar 12, and a "Color
 * code" field taking `#rrggbb` with or without the `#`, a chip of the colour beside it. A wrong code is the field's
 * error; the chip, the ring and the stage keep the last good colour.
 */
export function ColorPicker({ value, onChange, onInvalidChange, invalid }: Props) {
  const t = useTranslations("settings.appearance.color");
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(value));
  const [code, setCode] = React.useState(value);

  // A colour picked elsewhere (a ring, the code) moves the square and the bar; the hue survives a grey.
  React.useEffect(() => {
    setHsv((current) => {
      if (hsvToHex(current) === value) return current;
      const next = hexToHsv(value);
      return next.s === 0 ? { ...next, h: current.h } : next;
    });
    setCode((current) => (parseColorCode(current) === value ? current : value));
  }, [value]);

  const pick = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setCode(hex);
    onInvalidChange(false);
    onChange(hex);
  };

  const square = useDrag((x, y) => pick({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag((x) => pick({ ...hsv, h: Math.min(359.9, x * 360) }));

  const nudge = (event: React.KeyboardEvent, axis: "s" | "v" | "h") => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp" ? step : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -step : 0;
    if (!delta) return;
    event.preventDefault();
    if (axis === "h") pick({ ...hsv, h: (hsv.h + delta * 360 + 360) % 360 });
    else if (axis === "s" && (event.key === "ArrowRight" || event.key === "ArrowLeft")) pick({ ...hsv, s: clamp01(hsv.s + delta) });
    else pick({ ...hsv, v: clamp01(hsv.v + delta) });
  };

  const typed = (text: string) => {
    setCode(text);
    const parsed = parseColorCode(text);
    onInvalidChange(parsed === null && text.trim().length > 0);
    if (parsed) {
      setHsv(hexToHsv(parsed));
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="appearance-sv"
        style={{ "--hue": `${Math.round(hsv.h)}` } as React.CSSProperties}
        role="slider"
        tabIndex={0}
        aria-label={t("square")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.v * 100)}
        onKeyDown={(event) => nudge(event, "s")}
        {...square}
      >
        <span className="appearance-knob" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }} />
      </div>

      <div
        className="appearance-hue"
        role="slider"
        tabIndex={0}
        aria-label={t("hue")}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        onKeyDown={(event) => nudge(event, "h")}
        {...hue}
      >
        <span className="appearance-knob" style={{ left: `${(hsv.h / 360) * 100}%`, background: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="appearance-color-code" className="mb-0">{t("code")}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="appearance-color-code"
            value={code}
            onChange={(event) => typed(event.currentTarget.value)}
            aria-invalid={invalid}
            spellCheck={false}
            className="font-mono"
          />
          <span aria-hidden className="size-9 shrink-0 rounded-control ring-1 ring-divider" style={{ backgroundColor: value }} />
        </div>
        {invalid ? <FieldError>{t("invalid")}</FieldError> : null}
      </div>
    </div>
  );
}
