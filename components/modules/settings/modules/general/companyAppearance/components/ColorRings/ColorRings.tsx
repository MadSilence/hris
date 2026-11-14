"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import {
  ACCENT_GRID,
  ACCENT_PRESET_LABEL_KEYS,
  ACCENT_PRESETS,
  deriveAccentInputs,
  isCloseToApproved,
  resolveAccent,
} from "@/lib/theme/accent";
import { accentKey, customOf } from "@/components/modules/settings/modules/general/companyAppearance/appearanceDraft";
import { ColorPicker } from "./ColorPicker";

type Props = {
  /** The draft colour: a preset's name, a `#rrggbb`, or null (Wine). */
  value: string | null;
  onChange: (accent: string) => void;
  /** Up to three colours from the logo; the row is absent without them. */
  logoColors: string[];
  /** The colour "Your own" starts from when it is opened. */
  ownStart: string;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  codeInvalid: boolean;
  onCodeInvalidChange: (invalid: boolean) => void;
  disabled?: boolean;
};

type Swatch = { key: string; color: string; label: string; own?: boolean; hexUnder?: boolean };

/**
 * Step 2 (sign-in-appearance § Layout): "From your logo" — up to three rings from the file — a divider, then the nine
 * presets on a 5-column grid and "Your own", a conic ring that opens the picker beside the rings, over the stage, so
 * nothing below moves. One radio group: Tab lands on the picked ring, the arrow keys move along all of them.
 */
export function ColorRings({
  value,
  onChange,
  logoColors,
  ownStart,
  pickerOpen,
  onPickerOpenChange,
  codeInvalid,
  onCodeInvalidChange,
  disabled = false,
}: Props) {
  const t = useTranslations("settings.appearance.color");
  const tCommon = useTranslations("common");
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const picked = accentKey(value);
  const custom = customOf(value);
  const fromLogo = logoColors.map((c) => c.toLowerCase());
  const ownPicked = custom !== null && !fromLogo.includes(custom);
  const resolved = resolveAccent(value);

  const logoSwatches: Swatch[] = fromLogo.map((color) => ({ key: color, color, label: color.toUpperCase(), hexUnder: true }));
  const presetSwatches: Swatch[] = ACCENT_GRID.map((preset) => ({
    key: preset,
    color: ACCENT_PRESETS[preset],
    label: tCommon(ACCENT_PRESET_LABEL_KEYS[preset]),
  }));
  const own: Swatch = { key: "own", color: custom ?? ownStart, label: t("yourOwn"), own: true };
  const all = [...logoSwatches, ...presetSwatches, own];

  const isPicked = (swatch: Swatch) => (swatch.own ? ownPicked : swatch.key === picked);
  const tabStop = Math.max(0, all.findIndex(isPicked));

  const choose = (swatch: Swatch) => {
    if (swatch.own) {
      onChange(custom ?? ownStart);
      onPickerOpenChange(true);
      return;
    }
    onPickerOpenChange(false);
    onCodeInvalidChange(false);
    onChange(swatch.key);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + all.length) % all.length;
    refs.current[next]?.focus();
    choose(all[next]);
  };

  const ring = (swatch: Swatch, index: number) => {
    const checked = isPicked(swatch);
    return (
      <button
        key={swatch.key}
        ref={(el) => {
          refs.current[index] = el;
        }}
        type="button"
        role="radio"
        aria-checked={checked}
        aria-label={swatch.label}
        tabIndex={index === tabStop ? 0 : -1}
        disabled={disabled}
        onClick={() => choose(swatch)}
        onKeyDown={(event) => onKeyDown(event, index)}
        className="appearance-swatch"
      >
        <span
          aria-hidden
          className="appearance-ring"
          data-own={swatch.own || undefined}
          style={{ "--ring": swatch.color } as React.CSSProperties}
        />
        {swatch.hexUnder ? (
          checked ? <span className="appearance-swatch-name font-mono">{swatch.label}</span> : null
        ) : (
          <span className="appearance-swatch-name">{swatch.label}</span>
        )}
      </button>
    );
  };

  const adjusted = deriveAccentInputs(resolved.kind === "preset" ? ACCENT_PRESETS[resolved.preset] : resolved.hex).adjusted;
  const close = isCloseToApproved(value);

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={t("ours")} className="flex flex-col">
        {logoSwatches.length > 0 && (
          <>
            <p className="m-0 mb-3 text-label font-normal text-tertiary">{t("fromLogo")}</p>
            <div className="appearance-rings">{logoSwatches.map((swatch, i) => ring(swatch, i))}</div>
            <div className="my-4 border-t border-divider" />
          </>
        )}

        <Popover open={pickerOpen && !disabled} onOpenChange={onPickerOpenChange}>
          <PopoverAnchor asChild>
            <div className="appearance-rings">
              {presetSwatches.map((swatch, i) => ring(swatch, logoSwatches.length + i))}
              {ring(own, all.length - 1)}
            </div>
          </PopoverAnchor>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={24}
            className="w-[260px]"
            aria-label={t("picker")}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <ColorPicker
              value={custom ?? ownStart}
              onChange={onChange}
              invalid={codeInvalid}
              onInvalidChange={onCodeInvalidChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex min-h-5 flex-col gap-1">
        {ownPicked && custom ? <p className="m-0 text-label font-normal text-secondary">{t("yourOwnPicked", { hex: custom.toUpperCase() })}</p> : null}
        {adjusted ? <Quiet>{t("adjusted")}</Quiet> : null}
        {close ? <Quiet>{t("closeToApproved")}</Quiet> : null}
      </div>
    </div>
  );
}

/** A quiet line under the rings: 14 icon, 13/18 tertiary. Nothing is blocked. */
function Quiet({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 flex items-start gap-1.5 text-label font-normal text-tertiary">
      <Icon icon={InformationCircleIcon} size="sm" className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}
