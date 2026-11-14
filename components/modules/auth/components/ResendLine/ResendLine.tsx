"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

/**
 * "Not there in a few minutes? Check your spam folder or resend." under every "check your email" (A4, B2, C10, F2).
 * After a resend: "Sent again. Check your spam folder too." Refused — sent too often, or anything else — it keeps only
 * "Check your spam folder." and offers no more resends; the limit is the server's (`AuthAbuseLimiter`).
 *
 * `onResend` answers null when the email went, or the refusal's sentence.
 */
export function ResendLine({ onResend }: { onResend: () => Promise<string | null> }) {
  const t = useTranslations("auth");
  const [state, setState] = React.useState<"idle" | "busy" | "sent" | "stopped">("idle");

  const resend = async () => {
    if (state === "busy") return;
    setState("busy");
    const refused = await onResend();
    setState(refused ? "stopped" : "sent");
  };

  if (state === "stopped") return <p className="text-body text-secondary">{t("resend.tooOften")}</p>;
  if (state === "sent") {
    return (
      <p className="text-body text-secondary" role="status">
        {t("resend.sent")} {t("resend.sentHint")}
      </p>
    );
  }
  return (
    <p className="text-body text-secondary">
      {t("resend.question")}
      <br />
      {state === "busy"
        ? t("busy.resending")
        : t.rich("resend.action", {
            link: (chunks) => (
              <button type="button" onClick={resend} className="text-accent-text underline-offset-4 hover:underline">
                {chunks}
              </button>
            ),
          })}
    </p>
  );
}
