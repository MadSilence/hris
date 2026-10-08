import type { ReactNode } from "react";

import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * The look every sign-in screen shares: soft, blurred colour and a dot grid behind a frosted card.
 *
 * Used by a company's own login, "sign in to your company" and "find your company" on the root, and
 * mirrored by the Appearance preview, which draws `AuthBackdrop` itself — so what the settings show is
 * what the login page is.
 *
 * **Server-safe and painted with `brown-*` only.** Those utilities are re-hued by the brand palette, so
 * on a company's address the backdrop arrives in its colour from the first frame, and inside the preview
 * they take the draft colour (`buildScopedBrandStyleSheet`). No hooks, no motion: nothing here may
 * change after the first frame (`technical_documentation/COMPANY_ADDRESSES.md` § 4).
 */

/** The backdrop alone, for a surface that already has its own size — the screen below, or the preview. */
export function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* The wash: large, heavily blurred blobs that set the colour of the whole surface. */}
      <span className="absolute -left-40 -top-48 h-[620px] w-[620px] rounded-full bg-brown-400 opacity-50 blur-[110px]" />
      <span className="absolute -bottom-56 -right-32 h-[680px] w-[680px] rounded-full bg-brown-600 opacity-45 blur-[120px]" />
      <span className="absolute right-[8%] top-[4%] h-[320px] w-[320px] rounded-full bg-brown-300 opacity-80 blur-[70px]" />
      <span className="absolute bottom-[2%] left-[6%] h-[260px] w-[460px] -rotate-12 rounded-[45%] bg-brown-500 opacity-35 blur-[90px]" />
      {/* A glow just behind the card, offset so it spills out of one corner. */}
      <span className="absolute left-1/2 top-1/2 h-[360px] w-[560px] -translate-x-[30%] -translate-y-[10%] rounded-full bg-brown-500 opacity-30 blur-[100px]" />

      {/* A dot grid that fades out toward the edges. */}
      <span className="absolute inset-0 text-brown-500 opacity-30 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
    </div>
  );
}

/** The card the form sits on — frosted, so the colour shows through at its edges. */
export const AUTH_CARD_CLASS =
  "relative w-full max-w-[560px] rounded-3xl bg-white/85 p-8 shadow-2xl ring-1 ring-white/70 backdrop-blur-xl sm:p-12";

type Props = {
  children: ReactNode;
  /** The company's own picture, in place of the backdrop. Preloaded, never faded in. */
  backgroundUrl?: string | null;
  /** Sizing from the page: a whole screen on a company's address, the space between the navbar and the footer on the root. */
  className?: string;
  "data-test"?: string;
};

export default function AuthScreen({ children, backgroundUrl, className, "data-test": dataTest }: Props) {
  return (
    <div
      data-test={dataTest}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-brown-100 px-4 py-12",
        className,
      )}
    >
      {backgroundUrl ? (
        <>
          <link rel="preload" as="image" href={backgroundUrl} />
          {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
              the API origin, and would swap in a placeholder first — a repaint by design. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundUrl}
            alt=""
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </>
      ) : (
        <AuthBackdrop />
      )}

      <div className={AUTH_CARD_CLASS}>{children}</div>
    </div>
  );
}
