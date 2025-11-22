"use client";

import React from "react";
import styles from "./ColorSwatchPicker.module.css";
import { SOFT_PALETTE } from "@/models/colors";

type Props = {
  value: string;                 // текущий цвет (hex)
  onChange: (hex: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

/** Один круг-выбор: по клику открывает поповер с палитрой из 10 цветов. */
export const ColorSwatchPicker: React.FC<Props> = ({
  value,
  onChange,
  disabled = false,
  ariaLabel = "Pick color",
}) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // закрыть по клику вне
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (hex: string) => {
    onChange(hex);
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.swatch}
        style={{ backgroundColor: value }}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-label={ariaLabel}
        disabled={disabled}
        title={value}
      />
      {open && (
        <div className={styles.popover} role="dialog" aria-modal="true">
          <div className={styles.palette} role="listbox" aria-label="Color palette">
            {SOFT_PALETTE.map((hex) => {
              const selected = hex === value;
              return (
                <button
                  key={hex}
                  type="button"
                  className={`${styles.dot} ${selected ? styles.selected : ""}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => select(hex)}
                  aria-label={`Choose ${hex}`}
                  title={hex}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSwatchPicker;
