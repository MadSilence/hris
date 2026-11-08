"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The draft lives in the page, so leaving the page loses it. The App Router cannot block a
 * navigation, so this catches the two ways out: closing or reloading the tab (`beforeunload`), and
 * clicking an in-app link anywhere on the page — the back arrow, the sidebar — which is held until
 * the reader confirms.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(`${url.pathname}${url.search}${url.hash}`);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  return {
    pendingHref,
    stay: () => setPendingHref(null),
    leave: () => {
      const href = pendingHref;
      setPendingHref(null);
      if (href) router.push(href);
    },
  };
}
