"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

/**
 * The line under every "check your email" (A4, B2, C10, F2), 13/18 tertiary on one line that wraps only when it must, its
 * "resend" 12/16 500 accent-text (the designers' login fix A4).
 *
 * - `kind="link"` (A4, F2 — an email with a link): "Not there in a few minutes? Check your spam folder or resend.",
 *   after a resend "Sent again. Check your spam folder too."
 * - `kind="code"` (B2, C10 — a code typed here): "Didn’t get it? Check your spam folder or resend.", after a resend
 *   "We’ve sent a new code. Check your spam folder too." (C13, C15); `onSent` then lets the step clear its error and
 *   empty the boxes.
 *
 * Refused — sent too often, or anything else — it keeps only the spam folder and offers no more resends; the limit is
 * the server's (`AuthAbuseLimiter`).
 *
 * `onResend` answers null when the email went, or the refusal's sentence.
 */
export function ResendLine({ onResend, onSent, kind = "link" }: {
  onResend: () => Promise<string | null>;
  onSent?: () => void;
  kind?: "link" | "code";
}) {
  const t = useTranslations("auth");
  const [state, setState] = React.useState<"idle" | "busy" | "sent" | "stopped">("idle");

  const resend = async () => {
    if (state === "busy") return;
    setState("busy");
    const refused = await onResend();
    setState(refused ? "stopped" : "sent");
    if (!refused) onSent?.();
  };

  const line = "text-label font-normal text-tertiary";
  if (state === "stopped") return <p className={line}>{kind === "code" ? t("resend.codeTooOften") : t("resend.tooOften")}</p>;
  if (state === "sent") {
    return (
      <p className={line} role="status">
        {kind === "code" ? t("resend.codeSent") : `${t("resend.sent")} ${t("resend.sentHint")}`}
      </p>
    );
  }
  return (
    <p className={line}>
      {kind === "code" ? t("resend.codeQuestion") : t("resend.question")}{" "}
      {state === "busy"
        ? t("busy.resending")
        : t.rich("resend.action", {
            link: (chunks) => (
              <button type="button" onClick={resend}
                      className="text-hint font-medium text-accent-text underline-offset-4 hover:underline">
                {chunks}
              </button>
            ),
          })}
    </p>
  );
}
