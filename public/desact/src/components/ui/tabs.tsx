"use client";

import * as React from"react";
import * as TabsPrimitive from"@radix-ui/react-tabs";

import { cn } from"./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

type IndicatorRect = { left: number; top: number; width: number; height: number };

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  /**
   * "segmented" (default) renders a sliding pill behind the active trigger.
   * "underline" opts out of the pill for lists styled as underlined tabs.
   */
  variant?: "segmented" | "underline";
};

function TabsList({ className, variant = "segmented", children, ...props }: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<IndicatorRect | null>(null);
  // The pill must not animate into place on first paint — only on later moves.
  const [animate, setAnimate] = React.useState(false);

  React.useLayoutEffect(() => {
    if (variant !== "segmented") return;

    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]',
      );

      if (!active || active.offsetWidth === 0) {
        setRect(null);
        return;
      }

      setRect((previous) => {
        const next: IndicatorRect = {
          left: active.offsetLeft,
          top: active.offsetTop,
          width: active.offsetWidth,
          height: active.offsetHeight,
        };

        if (
          previous &&
          previous.left === next.left &&
          previous.top === next.top &&
          previous.width === next.width &&
          previous.height === next.height
        ) {
          return previous;
        }

        // Enable the transition only once a first position is known.
        if (previous) setAnimate(true);
        return next;
      });
    };

    measure();

    // Radix flips data-state on the triggers when the value changes.
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(list, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-state"],
    });

    // Keeps the pill aligned on resize, font load and when the list becomes visible.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(list);
    list
      .querySelectorAll('[data-slot="tabs-trigger"]')
      .forEach((trigger) => resizeObserver.observe(trigger));

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [variant, children]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground relative isolate inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
        className,
      )}
      {...props}
    >
      {variant === "segmented" && rect ? (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(
            // Slightly tighter than the track's rounded-xl so the pill nests inside it
            // instead of competing with its corners. Keep in sync with TabsTrigger.
            "pointer-events-none absolute z-0 rounded-[11px] bg-card shadow-sm",
            animate && "transition-all duration-300 ease-out",
          )}
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : null}

      {children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // No active background here: the sliding indicator in TabsList paints it.
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground relative z-10 inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-[11px] border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
