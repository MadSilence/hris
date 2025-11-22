import * as React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.root,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      {...props}
    />
  );
}

export default Button;
