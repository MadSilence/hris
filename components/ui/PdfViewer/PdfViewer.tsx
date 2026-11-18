"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { cn } from "@/lib/cn";

type PdfDocument = {
  numPages: number;
  getPage(n: number): Promise<PdfPage>;
  destroy(): Promise<void>;
};
type PdfPage = {
  getViewport(o: { scale: number }): { width: number; height: number };
  render(o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void>; cancel(): void };
};

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** pdf.js, loaded on first use and only in the browser: its worker runs beside the page, never on the server. */
let loader: Promise<typeof import("pdfjs-dist")> | null = null;
const pdfjs = () => {
  loader ??= import("pdfjs-dist").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    return lib;
  });
  return loader;
};

/**
 * A PDF drawn by us (A2, 2026-11-18 — `pdf.js`, Apache-2.0): the same in every browser and readable on a phone, where
 * the browser's own viewer is weak or missing. Pages fit the width and stack on a Mist stage; zoom steps through six
 * sizes; the counter says which page is in view. `src` is a URL the page may fetch — a blob of the bytes it already
 * read through the BFF.
 */
export const PdfViewer: React.FC<{ src: string; title: string; className?: string }> = ({ src, title, className }) => {
  const t = useTranslations("common");
  const stage = React.useRef<HTMLDivElement>(null);
  const [doc, setDoc] = React.useState<PdfDocument | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const [zoom, setZoom] = React.useState<(typeof ZOOMS)[number]>(1);
  const [current, setCurrent] = React.useState(1);

  React.useEffect(() => {
    let cancelled = false;
    let loaded: PdfDocument | null = null;
    setDoc(null);
    setFailed(false);
    (async () => {
      try {
        const bytes = await fetch(src).then((r) => r.arrayBuffer());
        const lib = await pdfjs();
        loaded = (await lib.getDocument({ data: new Uint8Array(bytes) }).promise) as unknown as PdfDocument;
        if (cancelled) void loaded.destroy();
        else setDoc(loaded);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (loaded) void loaded.destroy();
    };
  }, [src]);

  React.useEffect(() => {
    const el = stage.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = () => {
    const el = stage.current;
    if (!el) return;
    const pages = [...el.querySelectorAll<HTMLElement>("[data-page]")];
    const middle = el.scrollTop + el.clientHeight / 3;
    const seen = pages.findLast((p) => p.offsetTop <= middle);
    if (seen) setCurrent(Number(seen.dataset.page));
  };

  const step = (dir: 1 | -1) => {
    const i = ZOOMS.indexOf(zoom) + dir;
    if (i >= 0 && i < ZOOMS.length) setZoom(ZOOMS[i]);
  };

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden bg-subtle", className)}>
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-divider bg-card px-3">
        <span className="truncate text-label text-secondary" title={title}>{title}</span>
        <div className="flex shrink-0 items-center gap-1">
          {doc && (
            <span className="mr-2 text-hint tabular-nums text-tertiary">{t("pdf.page", { current, total: doc.numPages })}</span>
          )}
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pdf.zoomOut")} disabled={zoom === ZOOMS[0]} onClick={() => step(-1)}>
            <Icon icon={MinusSignIcon} size="sm" />
          </Button>
          <span className="w-10 text-center text-hint tabular-nums text-secondary">{Math.round(zoom * 100)}%</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pdf.zoomIn")} disabled={zoom === ZOOMS[ZOOMS.length - 1]} onClick={() => step(1)}>
            <Icon icon={PlusSignIcon} size="sm" />
          </Button>
        </div>
      </div>
      <div ref={stage} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-auto p-4" role="document" aria-label={title}>
        {failed ? (
          <p className="py-16 text-center text-body text-secondary">{t("pdf.failed")}</p>
        ) : !doc || width === 0 ? (
          <div className="flex justify-center py-16"><NodRing size="md" /></div>
        ) : (
          <div className="mx-auto flex w-fit flex-col items-center gap-4">
            {Array.from({ length: doc.numPages }, (_, i) => (
              <PdfPageCanvas key={i} doc={doc} number={i + 1} width={Math.max(200, (width - 32) * zoom)} label={t("pdf.pageLabel", { n: i + 1 })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/** One page at the given width, drawn sharp on a high-density screen; redrawn when the width changes. */
const PdfPageCanvas: React.FC<{ doc: PdfDocument; number: number; width: number; label: string }> = ({ doc, number, width, label }) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [height, setHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    let task: { cancel(): void } | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(number);
      if (cancelled || !canvas.current) return;
      const base = page.getViewport({ scale: 1 });
      const scale = width / base.width;
      const ratio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * ratio });
      const el = canvas.current;
      el.width = Math.floor(viewport.width);
      el.height = Math.floor(viewport.height);
      el.style.width = `${Math.floor(width)}px`;
      el.style.height = `${Math.floor(viewport.height / ratio)}px`;
      setHeight(Math.floor(viewport.height / ratio));
      const context = el.getContext("2d");
      if (!context) return;
      const rendering = page.render({ canvasContext: context, viewport });
      task = rendering;
      await rendering.promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, number, width]);

  return (
    <div data-page={number} className="bg-card shadow-raised" style={{ width: Math.floor(width), minHeight: height ?? Math.floor(width * 1.294) }}>
      <canvas ref={canvas} aria-label={label} role="img" />
    </div>
  );
};
