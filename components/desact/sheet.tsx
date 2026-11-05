"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/*
 * A side panel (SPEC § 13.7): to view or edit without losing the list. 480 px, or 640 with `wide`; radius 20
 * on the outer corners only, the level-3 shadow. On a phone it is a bottom sheet (`side="bottom"`): radius 20
 * on the top corners and a grab handle. It slides in from where it was opened and does not animate out.
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    data-slot="sheet-overlay"
    data-motion="dialog"
    className={cn("fixed inset-0 z-50 bg-scrim", className)}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
  side?: "right" | "bottom";
  wide?: boolean;
};

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", wide = false, className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-motion={side === "right" ? "panel" : "dialog"}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-overlay text-primary shadow-dialog",
          side === "right" &&
            cn(
              "inset-y-0 right-0 h-full w-full rounded-l-panel",
              wide ? "sm:max-w-(--side-panel-wide)" : "sm:max-w-(--side-panel)",
            ),
          side === "bottom" && "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-panel pt-2",
          className,
        )}
        {...props}
      >
        {side === "bottom" && <span aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-pill bg-field" />}
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-control text-tertiary transition-colors duration-(--duration-hover) hover:bg-mist hover:text-primary disabled:pointer-events-none">
          <Icon icon={Cancel01Icon} />
          <CloseLabel />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

function CloseLabel() {
  const t = useTranslations("common");
  return <span className="sr-only">{t("actions.close")}</span>;
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 px-6 pt-6 pr-14", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 border-t border-divider px-6 py-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-section-title text-primary", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body text-secondary", className)} {...props} />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
};
