import * as React from "react";

import { cn } from "@/lib/cn";

/*
 * Field chrome shared by every text-like control (SPEC § 13.3): 36 px, radius 8, the field border, the strong
 * border on hover, and on focus the accent border with a 3 px muted-accent halo and no offset (§ 13.1). An
 * invalid field gets the red border; the message under it is the caller's.
 */
export const fieldClasses = cn(
  "w-full min-w-0 rounded-control border border-field bg-card text-body text-primary",
  "transition-[border-color,box-shadow] duration-(--duration-hover) outline-none",
  "placeholder:text-tertiary hover:border-field-hover",
  "focus-visible:border-accent focus-visible:shadow-focus focus-visible:outline-none",
  "aria-invalid:border-danger aria-invalid:hover:border-danger",
  "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-disabled disabled:hover:border-field",
  "read-only:bg-subtle",
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        "h-9 px-3",
        "file:mr-3 file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-body file:font-medium file:text-primary",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
