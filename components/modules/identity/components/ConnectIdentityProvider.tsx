"use client";

import * as React from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { withStepUp } from "@/components/modules/mfa/stepUp";

const NAME: Record<string, string> = { OKTA: "Okta", ENTRA: "Microsoft", OTHER: "your identity provider" };

/**
 * Connect — the person links their own account to the company's identity provider (R1.3). The one way a
 * System Owner is ever linked: never by email. Asks "confirm it is you" first, then goes to the IdP and back.
 */
export const ConnectIdentityProvider: React.FC<{ provider: string | null; connected?: boolean }> = ({ provider, connected }) => {
  const { internalApiClient } = useAppDataContext();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await withStepUp(() => internalApiClient.post<{ redirectUrl: string }>("/auth/sso/connect"));
      window.location.assign(res.redirectUrl);
    } catch (e) {
      setError(messageForError(e));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {connected
          ? `Your account is connected to ${NAME[provider ?? "OTHER"]}.`
          : `Sign in with ${NAME[provider ?? "OTHER"]} as well as your password. A System Owner connects here, never by email.`}
      </p>
      <FormError message={error} />
      <Button type="button" variant="outline" onClick={connect} disabled={busy}>
        {busy ? "Connecting…" : `Connect ${NAME[provider ?? "OTHER"]}`}
      </Button>
    </div>
  );
};
