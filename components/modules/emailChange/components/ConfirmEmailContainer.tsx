"use client";

import React, { useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { confirmEmailChangeAction } from "@/components/modules/emailChange/actions/emailChangeActions";

type Props = {
  token: string;
  firstName: string | null;
  newEmail: string;
};

/**
 * Confirming a new sign-in address from the emailed link.
 *
 * A button rather than confirming on load: mail scanners open links to check them, and a link that
 * did its work on a GET would be used up by the scanner before the person ever saw it.
 */
export function ConfirmEmailContainer({ token, firstName, newEmail }: Props) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await confirmEmailChangeAction(token);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setDone(true);
      return;
    }
    setError(res.errorMessage ?? null);
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">Email Confirmed</h1>
        <p className="text-md text-muted-foreground">
          From now on you sign in with <span className="font-medium text-foreground">{newEmail}</span>.
        </p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-4xl font-medium">{firstName ? `Hi ${firstName}` : "Confirm Your Email"}</h1>
      <p className="text-md text-muted-foreground">
        Confirm <span className="font-medium text-foreground">{newEmail}</span> as your new sign-in email. Until
        you do, you keep signing in with your current address.
      </p>
      <FormError message={error} />
      <Button type="button" onClick={confirm} disabled={busy} className="h-11 w-full max-w-xs">
        {busy ? "Confirming…" : "Confirm Email"}
      </Button>
    </div>
  );
}
