"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { ApiError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";

/** The refusal of a code that ran out (`AuthBusinessError.EMAIL_CODE_EXPIRED`). */
export const CODE_EXPIRED = "AUTH00023";

/** What a code step shows under its field: the refusal's sentence, or — for an expired code — the sentence with its link. */
export type CodeError = { kind: "text"; message: string } | { kind: "expired" } | null;

/** A refusal from verifying a code, as {@link CodeError}. */
export const codeErrorOf = (err: unknown): CodeError =>
  err instanceof ApiError && err.code === CODE_EXPIRED ? { kind: "expired" } : { kind: "text", message: messageForError(err) };

/**
 * "This code has expired. Send a new one." — *Send a new one* sends a new code at once (the designers' fix C1: every
 * code step, the login's and the registration's). `onSend` answers null when it went, or the refusal's sentence.
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

  return (
    <>
      {t.rich("resend.codeExpired", {
        link: (chunks) => (
          <button type="button" onClick={() => void send()} aria-busy={busy || undefined}
                  className="text-accent-text underline-offset-4 hover:underline">
            {chunks}
          </button>
        ),
      })}
    </>
  );
}
