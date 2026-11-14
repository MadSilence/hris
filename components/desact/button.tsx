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
 *   destructive-confirm  the red fill, only inside the confirmation dialog, which then has no accent button — a red
 *                        outline instead in a red workspace (sign-in-appearance, rule 3)
 *   link                 inside text, "View all"
 *
 * Heights 32 / 36 / 44; an icon button is square and always carries an accessible name and a tooltip.
 * `loading` shows one nodding ring and ignores a second click. Given `loadingLabel` ("Saving…") the button
 * also swaps its label by itself and keeps its width: both labels, ring included, sit in one grid cell from the
 * start, the one not showing invisible and hidden from assistive technology, so nothing moves.
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
        // `btn-destructive-confirm`: a red workspace turns it into a red outline (styles/globals.css).
        "destructive-confirm":
          "btn-destructive-confirm bg-status-declined-fill text-on-accent hover:bg-status-declined-text active:bg-status-declined-text",
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

const STACKED_LABEL = "col-start-1 row-start-1 inline-flex items-center justify-center gap-2";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** The action is under way. Without `loadingLabel` the label should already read "Saving…", "Approving…". */
  loading?: boolean;
  /** What the button reads while `loading` ("Saving…"). Reserves the wider of the two labels; ignored with `asChild`. */
  loadingLabel?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingLabel, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const approve = variant === "approve";
    const stacked = !asChild && loadingLabel !== undefined;

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
        {loading && !approve && !stacked && <NodRing size="sm" label="" className="text-current" />}
        {approve && <ApproveRing />}
        {stacked ? (
          <span className="inline-grid place-items-center">
            <span aria-hidden={loading || undefined} className={cn(STACKED_LABEL, loading && "invisible")}>
              {children}
            </span>
            <span aria-hidden={!loading || undefined} className={cn(STACKED_LABEL, !loading && "invisible")}>
              {!approve && <NodRing size="sm" label="" className="text-current" />}
              {loadingLabel}
            </span>
          </span>
        ) : (
          <Slottable>{children}</Slottable>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
