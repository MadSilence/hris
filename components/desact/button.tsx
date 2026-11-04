import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { ApproveRing, NodRing } from "./nod";

/*
 * Buttons (SPEC § 13.2).
 *
 *   primary              the main action of an area — one per page header, dialog or card
 *   approve              primary, with the nod ring before the label; approvals only
 *   secondary            every other action, Decline, Not now, SSO
 *   ghost                toolbars, Cancel
 *   destructive          remove, terminate: secondary with red text
 *   destructive-confirm  the red fill, only inside the confirmation dialog, which then has no accent button
 *   link                 inside text, "View all"
 *
 * Heights 32 / 36 / 44; an icon button is square and always carries an accessible name and a tooltip.
 * `loading` swaps the content for one nodding ring and the "-ing…" label, keeps the width and ignores a
 * second click.
 */
const buttonVariants = cva(
  [
    "group/approve relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium",
    "transition-colors duration-(--duration-hover) ease-linear",
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-mist disabled:text-disabled",
    "aria-[busy=true]:pointer-events-none",
    "[&_svg]:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-strong",
        approve: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-strong",
        secondary:
          "border border-field bg-card text-primary hover:border-strong hover:bg-subtle active:bg-mist",
        ghost: "text-primary hover:bg-mist active:bg-divider",
        destructive:
          "border border-field bg-card text-danger-text hover:border-strong hover:bg-subtle active:bg-mist",
        "destructive-confirm":
          "bg-status-declined-fill text-on-accent hover:bg-status-declined-text active:bg-status-declined-text",
        link: "h-auto px-0 text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-label",
        md: "h-9 px-3.5 text-body",
        lg: "h-11 px-4.5 text-card-title",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** The action is under way: the label should already read "Saving…", "Approving…". */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const approve = variant === "approve";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant ?? "primary"}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={loading ? undefined : onClick}
        {...props}
 >
        {loading && !approve && <NodRing size="sm" label="" className="text-current" />}
        {approve && <ApproveRing />}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
