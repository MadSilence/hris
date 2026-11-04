import type { ReactNode } from "react";

import { PoweredByNoddo } from "@/components/brand";
import { cn } from "@/lib/cn";

/**
 * The look every sign-in screen shares (SPEC § 2): a calm Mist surface, one white card, nothing moving.
 *
 * Used by a company's own login, "sign in to your company" and "find your company" on the root, and
 * mirrored by the Appearance preview, which draws `AuthCard` and `AuthLogo` itself — so what the settings
 * show is what the login page is.
 *
 * **Two brands, never side by side.** On a company's address the company is primary: its logo heads the card,
 * its accent paints the button and the links, and noddo is only "powered by noddo" at the foot of the screen.
 * On the root every screen is noddo's own, and the navbar already carries the wordmark — so no footer here.
 *
 * **Server-safe.** No hooks, no motion: nothing here may change after the first frame
 * (`technical_documentation/COMPANY_ADDRESSES.md` § 4). The accent arrives on `<html>` with the HTML.
 */

/** The card the form sits on. */
export const AUTH_CARD_CLASS =
  "relative w-full max-w-[440px] rounded-panel border border-divider bg-card p-8 shadow-card sm:p-10";

/** The company's logo at the top of the card — up to 160 × 40, never stretched. Nothing when there is none. */
export function AuthLogo({ logoUrl }: { logoUrl?: string | null }) {
  if (!logoUrl) return null;
  return (
    // Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for the API origin.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" className="mx-auto mb-6 block max-h-10 max-w-40 object-contain" />
  );
}

export function AuthCard({ children, logoUrl, className }: { children: ReactNode; logoUrl?: string | null; className?: string }) {
  return (
    <div className={cn(AUTH_CARD_CLASS, className)}>
      <AuthLogo logoUrl={logoUrl} />
      {children}
    </div>
  );
}

type Props = {
  children: ReactNode;
  /** The company's own picture behind the card. Preloaded, never faded in. */
  backgroundUrl?: string | null;
  /** The company's logo, on its own address only. */
  logoUrl?: string | null;
  /** A company's screen: "powered by noddo" at the foot. The root's screens are noddo's own and leave it out. */
  poweredBy?: boolean;
  /** Sizing from the page: a whole screen on a company's address, the space between the navbar and the footer on the root. */
  className?: string;
  "data-test"?: string;
};

export default function AuthScreen({ children, backgroundUrl, logoUrl, poweredBy = false, className, "data-test": dataTest }: Props) {
  return (
    <div
      data-test={dataTest}
      className={cn("relative flex w-full flex-col items-center overflow-hidden bg-mist px-4", className)}
    >
      {backgroundUrl && (
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
      )}

      <div className="relative flex w-full flex-1 items-center justify-center py-12">
        <AuthCard logoUrl={logoUrl}>{children}</AuthCard>
      </div>

      {poweredBy && (
        <footer className="relative pb-6">
          <span className={cn(backgroundUrl && "rounded-pill bg-card px-3 py-1.5")}>
            <PoweredByNoddo />
          </span>
        </footer>
      )}
    </div>
  );
}
