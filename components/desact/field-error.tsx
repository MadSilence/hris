import * as React from "react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * The text under a field that says how to fix it (SPEC § 12): an alert icon and one sentence in error red. It
 * replaces the field's hint, and the field itself turns red through `aria-invalid`. Nothing when there is no
 * message, so it can sit under every field unconditionally.
 */
function FieldError({ children, className, id }: { children?: React.ReactNode; className?: string; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={cn("mt-1.5 flex items-start gap-1.5 text-hint text-danger-text", className)}>
      <Icon icon={Alert02Icon} size="sm" className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export { FieldError };
