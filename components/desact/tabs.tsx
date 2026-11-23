"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/cn";

/*
 * Tabs: a segmented track (the designers' profile fixes T1, confirmed 2026-11-19, on every tab row in the product).
 * The track is Mist, a pill, padding 4, gap 4, as wide as its content; a tab is a pill 28 high, padding 0 12,
 * 14/20 500 tertiary, Ink on hover with no fill; the picked tab takes accent-muted and accent-text — no shadow, no
 * border. Focus shows only on :focus-visible (2 px accent, offset 2, pill-shaped). Switching is instant. A row too
 * wide for its place scrolls sideways with soft fades at the edges, the picked tab kept in view; it never wraps.
 * Saved views above a table are tabs too.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

type Fade = "none" | "start" | "end" | "both";

const fadeOf = (el: HTMLElement): Fade => {
  const start = el.scrollLeft > 1;
  const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  return start && end ? "both" : start ? "start" : end ? "end" : "none";
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  const own = React.useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = React.useState<Fade>("none");

  React.useEffect(() => {
    const el = own.current;
    if (!el) return;
    const update = () => setFade(fadeOf(el));
    // The picked tab is kept in view: on mount, and whenever another tab becomes the picked one.
    const reveal = () => {
      const active = el.querySelector<HTMLElement>('[data-state="active"]');
      if (active && typeof active.scrollIntoView === "function") {
        active.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      update();
    };
    reveal();
    el.addEventListener("scroll", update, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resize?.observe(el);
    const picked = typeof MutationObserver === "undefined" ? null : new MutationObserver(reveal);
    picked?.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => {
      el.removeEventListener("scroll", update);
      resize?.disconnect();
      picked?.disconnect();
    };
  }, []);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        own.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="tabs-list"
      data-fade={fade}
      className={cn(
        "inline-flex w-fit max-w-full shrink-0 items-center gap-1 self-start overflow-x-auto rounded-pill bg-mist p-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "data-[fade=start]:[mask-image:linear-gradient(to_right,transparent,black_24px)]",
        "data-[fade=end]:[mask-image:linear-gradient(to_left,transparent,black_24px)]",
        "data-[fade=both]:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
        className,
      )}
      {...props}
    />
  );
});

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-2 rounded-pill px-3 text-body font-medium whitespace-nowrap text-tertiary",
        "hover:text-primary",
        "data-[state=active]:bg-accent-muted data-[state=active]:text-accent-text",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:text-disabled",
        "[&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
