import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/*
 * A small label on the tag shape (SPEC § 13.4): radius 6, 24 px (20 in dense tables), 12/16 medium.
 *
 *   neutral   a plain marker or value: "System", a role's name, a filter's value
 *   outline   the same on white with a hairline, where the label sits on a tinted surface
 *   count     a number on the accent, for navigation and tabs
 *
 * Not for statuses — those are `StatusBadge`, a pill with an icon and a word — and not for user-coloured
 * tags, which are `TagChip`.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-tag text-hint font-medium [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        neutral: "bg-mist text-secondary",
        outline: "border border-divider bg-card text-secondary",
        count: "min-w-5 rounded-pill bg-accent px-1.5 text-on-accent",
      },
      size: {
        sm: "h-5 px-1.5",
        md: "h-6 px-2",
      },
    },
    compoundVariants: [{ variant: "count", className: "h-5 px-1.5" }],
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
