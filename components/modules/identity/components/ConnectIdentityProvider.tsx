"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { withStepUp } from "@/components/modules/mfa/stepUp";

/** The provider as the messages choose between them (`{provider, select, …}`); anything else is "other". */
const providerArg = (provider: string | null): string =>
  provider === "OKTA" || provider === "ENTRA" ? provider
    : provider === "GOOGLE_WORKSPACE" ? "GOOGLE" : provider === "MICROSOFT_365" ? "MICROSOFT" : "OTHER";

/**
 * Connect — the person links their own account to the company's identity provider (R1.3). The one way a
 * System Owner is ever linked: never by email. Asks "confirm it is you" first, then goes to the IdP and back.
 */
export const ConnectIdentityProvider: React.FC<{ provider: string | null; connected?: boolean }> = ({ provider, connected }) => {
  const t = useTranslations("settings");
  const { internalApiClient } = useAppDataContext();
  const args = { provider: providerArg(provider) };
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      // The company's own Workspace or Microsoft 365 goes through our application (§ 11.4); any other provider, its own.
      const shared = provider === "GOOGLE_WORKSPACE" ? "GOOGLE" : provider === "MICROSOFT_365" ? "MICROSOFT" : null;
      const res = await withStepUp(() => shared
        ? internalApiClient.post<{ redirectUrl: string }>("/auth/provider/person", { purpose: "CONNECT", provider: shared, returnTo: "/preferences" })
        : internalApiClient.post<{ redirectUrl: string }>("/auth/sso/connect"));
      window.location.assign(res.redirectUrl);
    } catch (e) {
      setError(messageForError(e));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-body text-tertiary">
        {connected ? t("identity.connect.connected", args) : t("identity.connect.hint", args)}
      </p>
      <FormError message={error} />
      <Button type="button" variant="secondary" onClick={connect} disabled={busy}>
        {busy ? t("identity.connect.connecting") : t("identity.connect.button", args)}
      </Button>
    </div>
  );
};
