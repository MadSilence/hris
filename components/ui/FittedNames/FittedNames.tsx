"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * A field holding several picked values (the designers' MULTI-VALUE and AQ-17, 2026-11-20): **as many names as fit,
 * then "+N"** — "Design, Sales +1". The names are measured against the room they have and drop from the end until
 * they fit; one name that is still too long is cut with … and keeps its "+N". Rule: `FORMS_AND_FIELDS.md` § 9.
 */
export const FittedNames: React.FC<{ labels: string[]; className?: string }> = ({ labels, className }) => {
  const t = useTranslations("common");
  const namesRef = React.useRef<HTMLSpanElement>(null);
  const boxRef = React.useRef<HTMLSpanElement>(null);
  const key = labels.join("\u0001");
  const [count, setCount] = React.useState(labels.length);

  React.useLayoutEffect(() => setCount(labels.length), [key, labels.length]);

  // One fewer until the names fit (or one is left, which then truncates).
  React.useLayoutEffect(() => {
    const el = namesRef.current;
    if (el && count > 1 && el.scrollWidth > el.clientWidth) setCount((c) => c - 1);
  }, [count, key]);

  // A wider or narrower field starts the count over.
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      setCount(labels.length);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [key, labels.length]);

  const rest = labels.length - count;
  return (
    <span ref={boxRef} className={cn("flex min-w-0 items-center gap-1 whitespace-nowrap", className)}>
      <span ref={namesRef} className="min-w-0 truncate">
        {labels.slice(0, count).join(", ")}
      </span>
      {rest > 0 ? <span className="shrink-0 text-tertiary">{t("values.moreCount", { count: rest })}</span> : null}
    </span>
  );
};
