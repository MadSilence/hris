"use client";

import { useEffect, useState, type FC } from "react";
import { Globe2 } from "lucide-react";

import { cn } from "@/public/desact/src/components/ui/utils";

const isCountryCode = (code: string) => /^[A-Za-z]{2}$/.test(code);

type Props = {
  /** ISO 3166-1 alpha-2. Anything else (e.g. "GLOBAL") renders the globe instead. */
  countryCode: string | null | undefined;
  className?: string;
  title?: string;
};

/**
 * A country's flag, served from `public/flags` (see the README there).
 *
 * Emoji flags are not an option: Chrome and Edge on Windows ship no flag glyphs, so `🇩🇪` renders as
 * two boxed letters. A local SVG looks the same everywhere and costs no third-party request. A code
 * that has no file — or fails to load — falls back to a small code chip.
 */
export const CountryFlag: FC<Props> = ({ countryCode, className, title }) => {
  const code = countryCode?.trim().toUpperCase() ?? "";
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [code]);

  if (!isCountryCode(code)) {
    return (
      <Globe2
        aria-hidden
        className={cn("size-4 shrink-0 text-[var(--color-text-tertiary)]", className)}
      />
    );
  }

  const label = title ?? code;

  if (failed) {
    return (
      <span
        title={label}
        className={cn(
          "inline-flex h-4 shrink-0 items-center rounded-[3px] border border-brown-200 bg-brown-50 px-1",
          "font-mono text-[10px] leading-none tracking-tight text-brown-600",
          className,
        )}
      >
        {code}
      </span>
    );
  }

  return (
    // Plain <img>: these are tiny local files, and next/image would add a loader round-trip per flag.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.svg`}
      alt=""
      title={label}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        "h-4 w-6 shrink-0 rounded-[2px] border border-black/10 object-cover",
        className,
      )}
    />
  );
};
