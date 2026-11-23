"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { InlineAlert } from "@/components/desact/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";

/**
 * One screen back: a ghost icon button 36, top-left of the white side, named and tooltipped "Back". `circle` is the
 * settings page's back (Appearance, sign-in-appearance L1): a white 40 circle with a hairline and a 16 Ink chevron;
 * the login screens keep the ghost.
 */
export function AuthBack({ href, onClick, variant = "ghost" }: { href?: string; onClick?: () => void; variant?: "ghost" | "circle" }) {
  const t = useTranslations("common");
  const className =
    variant === "circle"
      ? "inline-flex size-10 shrink-0 items-center justify-center rounded-pill border border-divider bg-card text-primary hover:bg-subtle active:bg-mist"
      : "inline-flex size-9 items-center justify-center rounded-control text-secondary hover:bg-mist active:bg-divider";
  const icon = <Icon icon={ArrowLeft01Icon} size={variant === "circle" ? "sm" : "md"} />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Link href={href} className={className} aria-label={t("actions.back")}>{icon}</Link>
        ) : (
          <button type="button" onClick={onClick} className={className} aria-label={t("actions.back")}>{icon}</button>
        )}
      </TooltipTrigger>
      <TooltipContent>{t("actions.back")}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The heading of a step, its lead under it, and — for "check your email" or an error — the circle above: a block of
 * its own, 20 above the title (the designers' login fix A3; the head's own gap is 8, so 12 more here).
 */
export function AuthHeading({
  title,
  lead,
  icon,
  tone = "grey",
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  icon?: IconSvgElement;
  tone?: "grey" | "accent";
}) {
  return (
    <div className="auth-step-head">
      {icon && (
        <span className="auth-icon-circle mb-3" data-tone={tone} aria-hidden="true">
          <Icon icon={icon} size="lg" />
        </span>
      )}
      <h1 className="text-auth-title text-primary">{title}</h1>
      {lead && <p className="text-auth-lead text-secondary">{lead}</p>}
    </div>
  );
}

/**
 * A refusal on a login screen (the designers' login fix C10): the shared declined `InlineAlert`, drawn the login's way —
 * Declined soft with no border, radius 10, 12 inside, gap 8, 13/18 in Error text. It is the first thing in the form,
 * above the provider buttons or the first field, and every refusal takes this one place: a wrong password, too many
 * attempts, a provider's or our side's failure. Elsewhere the alert keeps its border.
 */
export function AuthAlert({ children }: { children: React.ReactNode }) {
  return (
    <InlineAlert tone="declined" className="gap-2 rounded-popover border-0 p-3 text-label font-normal">
      {children}
    </InlineAlert>
  );
}

/** "or" between the provider buttons and the form. */
export function AuthOr() {
  const t = useTranslations("auth");
  return (
    <div className="flex items-center gap-3 text-hint text-tertiary">
      <span className="h-px flex-1 bg-divider" />
      {t("login.or")}
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
}

const PROVIDER_MARK = { GOOGLE: "/brand/providers/google.png", MICROSOFT: "/brand/providers/microsoft.png" } as const;

/**
 * Continue with Google / Microsoft: always the provider's standard white button with its official mark, never the
 * accent — also when it is the only way in (the providers' brand rules). A link, so the round trip is a navigation.
 */
export function ProviderButton({
  provider,
  href,
  label,
  className,
}: {
  provider: keyof typeof PROVIDER_MARK;
  href: string;
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <a
      href={href}
      onClick={() => setBusy(true)}
      aria-busy={busy || undefined}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-3 rounded-control border border-field bg-card px-4.5",
        "text-card-title font-medium text-primary hover:border-strong hover:bg-subtle active:bg-mist",
        "aria-[busy=true]:pointer-events-none",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a 20 px brand file, not a photo */}
      <img src={PROVIDER_MARK[provider]} alt="" width={20} height={20} className="block flex-none" />
      {label}
    </a>
  );
}

/**
 * The six boxes a code is typed into (B2, C10, D1, D4, F6). Paste fills all six; the sixth digit submits by itself;
 * `one-time-code` lets the phone offer the code from the email or the SMS bar.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  invalid = false,
  disabled = false,
  autoFocus = false,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  label: string;
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (clean.length === 6) onComplete?.(clean);
    return clean;
  };

  return (
    <div className="auth-code" data-invalid={invalid} role="group" aria-label={label}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={digit}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? 6 : 1}
          aria-label={`${label} ${i + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => {
            const typed = e.currentTarget.value.replace(/\D/g, "");
            if (typed.length > 1) {
              // A paste, or the phone's one-time-code fill: the whole code at once.
              const clean = set(typed);
              refs.current[Math.min(clean.length, 5)]?.focus();
              return;
            }
            const next = (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, 6);
            set(next);
            if (typed && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && i > 0) {
              set(value.slice(0, i - 1) + value.slice(i));
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const clean = set(e.clipboardData.getData("text"));
            refs.current[Math.min(clean.length, 5)]?.focus();
          }}
        />
      ))}
    </div>
  );
}
