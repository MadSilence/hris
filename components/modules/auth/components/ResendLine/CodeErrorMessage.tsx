"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { ApiError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";

/** The refusal of a code that ran out (`AuthBusinessError.EMAIL_CODE_EXPIRED`). */
export const CODE_EXPIRED = "AUTH00023";
/** A wrong code (`AuthBusinessError.EMAIL_CODE_WRONG`). */
export const CODE_WRONG = "AUTH00022";
/** The fifth wrong try, which spends the code (`EmailCodeService.check` → `TOO_MANY_REQUESTS`). */
export const CODE_TOO_MANY = "AUTH00031";

/**
 * What a code step shows under its field: the refusal's sentence; for a wrong code the sentence and a separate *Send a
 * new code* (the designers' E, 2026-11-20); for an expired one, or one used up by wrong tries (DQ-17), the sentence with
 * its link.
 */
export type CodeError =
  | { kind: "text"; message: string }
  | { kind: "wrong" }
  | { kind: "expired" }
  | { kind: "tooMany" }
  | null;

/**
 * A refusal from verifying a code, as {@link CodeError}. `usedUp`: this step's code was already spent by wrong tries —
 * the server then answers "expired" for it, and the step keeps saying "Too many wrong codes" instead, because the code
 * never ran out of time (DQ-17; the designers' login rule C14: never "expired" for a code that did not expire).
 */
export const codeErrorOf = (err: unknown, usedUp = false): CodeError => {
  const code = err instanceof ApiError ? err.code : undefined;
  if (code === CODE_TOO_MANY || (usedUp && code === CODE_EXPIRED)) return { kind: "tooMany" };
  if (code === CODE_EXPIRED) return { kind: "expired" };
  if (code === CODE_WRONG) return { kind: "wrong" };
  return { kind: "text", message: messageForError(err) };
};

/**
 * The refusal under a code's boxes. *Send a new one* / *Send a new code* sends a new code at once (the designers' fix
 * C1: every code step, the login's and the registration's). `onSend` answers null when it went, or the refusal's
 * sentence.
 */
export function CodeErrorMessage({ error, onSend, onSent }: {
  error: CodeError;
  onSend: () => Promise<string | null>;
  onSent: (refusal: string | null) => void;
}) {
  const t = useTranslations("auth");
  const [busy, setBusy] = React.useState(false);
  if (!error) return null;
  if (error.kind === "text") return <>{error.message}</>;

  const send = async () => {
    if (busy) return;
    setBusy(true);
    const refused = await onSend();
    setBusy(false);
    onSent(refused);
  };
  const link = (chunks: React.ReactNode) => (
    <button type="button" onClick={() => void send()} aria-busy={busy || undefined}
            className="text-accent-text underline-offset-4 hover:underline">
      {chunks}
    </button>
  );

  // E: plain text, and the action a separate link under it — the same as the signing page's code step.
  if (error.kind === "wrong") {
    return (
      <>
        {t("resend.codeWrong")}
        <span className="mt-1 block">{link(t("resend.sendNewCode"))}</span>
      </>
    );
  }
  return <>{t.rich(error.kind === "tooMany" ? "resend.codeTooMany" : "resend.codeExpired", { link })}</>;
}
