import * as React from "react";
import styles from "./Input.module.css";

type InputTone = "default" | "success" | "error";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Optional label shown above the input */
  label?: string;
  /** Optional hint shown below the input */
  hint?: string;
  /** Visual tone (success / error). If `error` is provided, this is overridden to "error". */
  tone?: InputTone;
  /** Render required asterisk and set aria-required */
  required?: boolean;
  /** Validation error message. If present, input is rendered in error state and message is shown. */
  error?: string;
  /** If used inside InputGroup, we can tweak radii/borders */
  groupPosition?: "solo" | "left" | "right";
}

/** Small class combiner */
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      hint,
      tone = "default",
      required = false,
      disabled = false,
      error,
      className,
      groupPosition = "solo",
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId();
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const visualTone: InputTone = error ? "error" : tone;

    return (
      <div className={cn(styles.root, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            styles.input,
            styles[visualTone],
            disabled && styles.disabled,
            groupPosition !== "solo" && styles.grouped,
            groupPosition === "left" && styles.left,
            groupPosition === "right" && styles.right,
          )}
          aria-invalid={visualTone === "error" ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          disabled={disabled}
          {...props}
        />

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
  },
);

Input.displayName = "Input";

export default Input;
