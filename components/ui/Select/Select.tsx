"use client";

import * as React from "react";
import styles from "./Select.module.css";
import ArrowUp from "@/public/icons/arrow-up.svg";
import ArrowDown from "@/public/icons/arrow-down.svg";

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Tone = "default" | "success" | "error";

export interface SelectProps {
  /** Controlled value (string) */
  value: string | null;
  /** Options */
  options: Option[];
  /** Change handler */
  onChange: (v: any) => void;

  id?: string;
  label?: string;
  hint?: string;
  tone?: Tone;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  groupPosition?: "solo" | "left" | "right";
  placeholder?: string;

  /** Фиксация ширины меню по ширине триггера (теперь меню в потоке, но ширину можно заблокировать) */
  matchTriggerWidth?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Select({
  id,
  label,
  hint,
  tone = "default",
  required = false,
  disabled = false,
  error,
  className,
  groupPosition = "solo",
  value,
  options,
  onChange,
  placeholder = "Select…",
  matchTriggerWidth = true,
}: SelectProps) {
  const internalId = React.useId();
  const selectId = id ?? internalId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const visualTone: Tone = error ? "error" : tone;

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() => {
    const idx = options.findIndex(o => o.value === value);
    return idx >= 0 ? idx : 0;
  });

  const selected = options.find(o => o.value === value) ?? null;

  React.useEffect(() => {
    const idx = options.findIndex(o => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  // Закрытие по клику снаружи и Esc
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !listRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openList = () => !disabled && setOpen(true);
  const closeList = () => setOpen(false);

  const moveActive = (dir: 1 | -1) => {
    if (!options.length) return;
    let i = activeIndex;
    let safety = options.length + 2;
    do {
      i = (i + dir + options.length) % options.length;
      safety--;
    } while (options[i]?.disabled && safety > 0);
    setActiveIndex(i);
    const el = listRef.current?.querySelectorAll<HTMLLIElement>("[role='option']")[i];
    el?.scrollIntoView({ block: "nearest" });
  };

  const onButtonKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        moveActive(e.key === "ArrowDown" ? 1 : -1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setOpen(o => !o);
        break;
      case "Home":
      case "End":
        e.preventDefault();
        setOpen(true);
        setActiveIndex(e.key === "Home" ? 0 : options.length - 1);
        break;
    }
  };

  const onOptionClick = (idx: number) => {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    closeList();
    buttonRef.current?.focus();
  };

  const onListKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (e) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        moveActive(e.key === "ArrowDown" ? 1 : -1);
        break;
      case "Home":
      case "End":
        e.preventDefault();
        setActiveIndex(e.key === "Home" ? 0 : options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onOptionClick(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        closeList();
        buttonRef.current?.focus();
        break;
      case "Tab":
        closeList();
        break;
    }
  };

  return (
    <div className={cn(styles.root, className)}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <button
        id={selectId}
        ref={buttonRef}
        type="button"
        className={cn(
          styles.trigger,
          styles[visualTone],
          disabled && styles.disabled,
          groupPosition !== "solo" && styles.grouped,
          groupPosition === "left" && styles.left,
          groupPosition === "right" && styles.right,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${selectId}-listbox`}
        aria-invalid={visualTone === "error" ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onButtonKeyDown}
        disabled={disabled}
      >
        <span className={cn(styles.value, !selected && styles.placeholder)}>
          {selected?.label ?? placeholder}
        </span>

        <span className={styles.chevron} aria-hidden="true">
          {open ? <ArrowUp /> : <ArrowDown />}
        </span>
      </button>

      {open && (
        <ul
          id={`${selectId}-listbox`}
          ref={listRef}
          className={cn(styles.menu, matchTriggerWidth && styles.matchWidth)}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.value;
            const isActive = idx === activeIndex;
            return (
              <li
                key={`${opt.value}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                className={cn(
                  styles.option,
                  isSelected && styles.optionSelected,
                  isActive && styles.optionActive,
                  opt.disabled && styles.optionDisabled,
                )}
                onMouseEnter={() => !opt.disabled && setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onOptionClick(idx)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p id={errorId} className={styles.errorMsg} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
