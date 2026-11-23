"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/** The ink is the page's primary text colour — a role token, read from the canvas's own styles. */
const ink = (el: HTMLElement): string => getComputedStyle(el).color || "currentColor";

export type SignaturePadHandle = {
  /** The drawing as a PNG data URL with a transparent background, trimmed to what was drawn; null when empty. */
  toPng: () => string | null;
  clear: () => void;
};

/**
 * A pad to draw a signature on (documents-signing G03b–G03c, the phone's G03f): a pointer, a finger or a pen draws a
 * smooth ink line on a transparent canvas with a baseline. The drawing is exported trimmed and at most 2400 × 1200, the
 * size the backend accepts (SignatureDrawing).
 */
export const SignaturePad = React.forwardRef<
  SignaturePadHandle,
  { hint: string; className?: string; onChangeAction?: (hasInk: boolean) => void; image?: string | null }
>(function SignaturePad({ hint, className, onChangeAction, image }, ref) {
  const canvas = React.useRef<HTMLCanvasElement | null>(null);
  const drawing = React.useRef(false);
  const last = React.useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = React.useState(false);

  const ctx = () => canvas.current?.getContext("2d") ?? null;

  const resize = React.useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = c.getBoundingClientRect();
    c.width = Math.round(width * ratio);
    c.height = Math.round(height * ratio);
    const g = c.getContext("2d");
    if (g) {
      g.setTransform(ratio, 0, 0, ratio, 0, 0);
      g.lineCap = "round";
      g.lineJoin = "round";
      g.lineWidth = 2.4;
      g.strokeStyle = ink(c);
    }
    setHasInk(false);
    onChangeAction?.(false);
  }, [onChangeAction]);

  React.useEffect(() => {
    resize();
  }, [resize]);

  // A drawing that came from the phone is shown on the pad (G03e).
  React.useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const c = canvas.current;
      const g = ctx();
      if (!c || !g) return;
      const { width, height } = c.getBoundingClientRect();
      g.clearRect(0, 0, width, height);
      const scale = Math.min((width - 24) / img.width, (height - 24) / img.height, 1);
      g.drawImage(img, (width - img.width * scale) / 2, (height - img.height * scale) / 2, img.width * scale, img.height * scale);
      setHasInk(true);
      onChangeAction?.(true);
    };
    img.src = image;
  }, [image, onChangeAction]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const g = ctx();
    if (g && last.current) {
      g.beginPath();
      g.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
      g.fillStyle = ink(e.currentTarget);
      g.fill();
    }
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const g = ctx();
    const p = point(e);
    if (!g) return;
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    g.beginPath();
    g.moveTo(last.current.x, last.current.y);
    g.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last.current = p;
    if (!hasInk) {
      setHasInk(true);
      onChangeAction?.(true);
    }
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  React.useImperativeHandle(ref, () => ({
    clear: () => resize(),
    toPng: () => {
      const c = canvas.current;
      if (!c || !hasInk) return null;
      const g = c.getContext("2d");
      if (!g) return null;
      const { width, height } = c;
      const data = g.getImageData(0, 0, width, height).data;
      let minX = width, minY = height, maxX = -1, maxY = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4 + 3] > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) return null;
      const pad = 8;
      const w = Math.min(maxX - minX + 1 + pad * 2, 2400);
      const h = Math.min(maxY - minY + 1 + pad * 2, 1200);
      const out = document.createElement("canvas");
      out.width = Math.max(w, 20);
      out.height = Math.max(h, 10);
      out.getContext("2d")?.drawImage(c, minX - pad, minY - pad, w, h, 0, 0, w, h);
      return out.toDataURL("image/png");
    },
  }));

  return (
    <div className={cn("relative rounded-card border border-dashed border-strong bg-card", className)}>
      <canvas
        ref={canvas}
        className="block h-full w-full touch-none text-primary"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        aria-label={hint}
      />
      {/* G5: the baseline 40 above the bottom, 20 in; the hint in the middle until there is ink. */}
      <div className="pointer-events-none absolute inset-x-5 bottom-10 border-b border-field" />
      {!hasInk && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-label font-normal text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
});
