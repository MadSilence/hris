"use client";

import * as React from "react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { Textarea } from "@/components/desact/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import type { IdentityConnectionDTO, IdpGroupDTO } from "@/api/modules/identity/dto";
import {
  issueScimTokenAction,
  mapIdpGroupAction,
  revokeScimTokenAction,
  saveIdentityConnectionAction,
  testIdentityConnectionAction,
} from "@/components/modules/identity/actions";
import { useIdentityConnection, useIdpGroups, useInvalidateIdentity, useScimTokens } from "@/components/modules/identity/hooks";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";

const MODE_LABEL: Record<IdentityConnectionDTO["ssoMode"], string> = {
  OFF: "Off",
  OPTIONAL: "Optional — password or single sign-on",
  REQUIRED: "Required — single sign-on only (System Owners keep the password)",
};

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-hint text-tertiary">{label}</p>
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-tag bg-subtle px-2 py-1.5 text-hint">{value}</code>
      <Button type="button" variant="secondary" size="icon" aria-label={`Copy ${label}`} onClick={() => void navigator.clipboard?.writeText(value)}>
        <Icon icon={Copy01Icon} size="sm" />
      </Button>
    </div>
  </div>
);

/**
 * Settings → Login & SSO → Single Sign-On and Provisioning (ENTERPRISE_ACCESS_DESIGN.md § 4.6): the identity
 * provider, the SCIM tokens and the groups it pushed. Behind `SETTINGS.IDENTITY`; every change asks
 * "confirm it is you" and every System Owner is told.
 */
export const IdentitySettings: React.FC = () => {
  const connection = useIdentityConnection();
  if (connection.isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (connection.error) return <ErrorState error={connection.error} onRetry={() => void connection.refetch()} />;
  const c = connection.data!;
  return (
    <div className="max-w-2xl space-y-10">
      <ConnectionPanel c={c} />
      {c.configured && <ProvisioningPanel c={c} />}
      {c.configured && c.scimEnabled && <GroupsPanel />}
    </div>
  );
};

const ConnectionPanel: React.FC<{ c: IdentityConnectionDTO }> = ({ c }) => {
  const invalidate = useInvalidateIdentity();
  const [draft, setDraft] = React.useState({
    provider: c.provider ?? "OKTA",
    protocol: c.protocol,
    issuer: c.issuer ?? "",
    clientId: c.clientId ?? "",
    clientSecret: "",
    samlMetadataUrl: c.samlMetadataUrl ?? "",
    samlIdpEntityId: c.samlIdpEntityId ?? "",
    samlIdpSsoUrl: c.samlIdpSsoUrl ?? "",
    samlIdpCertificates: "",
    ssoMode: c.ssoMode,
    ssoSessionHours: c.ssoSessionHours,
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setBusy(true);
    setError(null);
    const body = {
      provider: draft.provider,
      protocol: draft.protocol,
      ssoMode: draft.ssoMode,
      ssoSessionHours: draft.ssoSessionHours,
      version: c.version,
      ...(draft.protocol === "OIDC"
        ? { issuer: draft.issuer, clientId: draft.clientId, ...(draft.clientSecret ? { clientSecret: draft.clientSecret } : {}) }
        : {
            samlMetadataUrl: draft.samlMetadataUrl,
            ...(draft.samlMetadataUrl
              ? {}
              : { samlIdpEntityId: draft.samlIdpEntityId, samlIdpSsoUrl: draft.samlIdpSsoUrl,
                  ...(draft.samlIdpCertificates ? { samlIdpCertificates: draft.samlIdpCertificates } : {}) }),
          }),
    };
    const res = await withStepUpAction(() => saveIdentityConnectionAction(body));
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setDraft((d) => ({ ...d, clientSecret: "", samlIdpCertificates: "" }));
      void invalidate();
      showSuccess("Single sign-on saved.");
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  const test = async () => {
    const res = await testIdentityConnectionAction();
    if (res.status === ActionStatus.SUCCESS && res.data) {
      if (res.data.ok) showSuccess(res.data.message);
      else showActionError({ errorMessage: res.data.message });
    } else showActionError(res);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-section-title text-primary">Single sign-on</h2>
        <StatusBadge status={c.ssoMode === "OFF" ? "inactive" : "active"} label={c.ssoMode === "OFF" ? "Off" : c.ssoMode === "REQUIRED" ? "Required" : "Optional"} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="idp-provider">Identity provider</Label>
          <Select value={draft.provider} onValueChange={(v) => set("provider", v as typeof draft.provider)}>
            <SelectTrigger id="idp-provider"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OKTA">Okta</SelectItem>
              <SelectItem value="ENTRA">Microsoft Entra ID</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-protocol">Protocol</Label>
          <Select value={draft.protocol} onValueChange={(v) => set("protocol", v as typeof draft.protocol)}>
            <SelectTrigger id="idp-protocol"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OIDC">OpenID connect</SelectItem>
              <SelectItem value="SAML">SAML 2.0</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {draft.protocol === "OIDC" ? (
        <div className="space-y-4">
          <CopyField label="Redirect URI — paste into the identity provider" value={c.redirectUri} />
          <div className="space-y-2">
            <Label htmlFor="idp-issuer">Issuer</Label>
            <Input id="idp-issuer" value={draft.issuer} onChange={(e) => set("issuer", e.currentTarget.value)} />
            <p className="text-hint text-tertiary">
              {draft.provider === "ENTRA"
                ? "Your tenant's own issuer, https://login.microsoftonline.com/<tenant id>/v2.0 — never “common”."
                : "For Okta, https://<your org>.okta.com or an authorization server's address."}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idp-client-id">Client ID</Label>
              <Input id="idp-client-id" value={draft.clientId} onChange={(e) => set("clientId", e.currentTarget.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idp-client-secret">Client secret</Label>
              <Input
                id="idp-client-secret"
                type="password"
                autoComplete="off"
                value={draft.clientSecret}
                onChange={(e) => set("clientSecret", e.currentTarget.value)}
              />
              <p className="text-hint text-tertiary">{c.clientSecretSet ? "Set. Type a new one to replace it." : "Not set."}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <CopyField label="Entity ID — paste into the identity provider" value={c.samlEntityId} />
          <CopyField label="Assertion consumer service URL" value={c.samlAcsUrl} />
          <div className="space-y-2">
            <Label htmlFor="idp-metadata">Identity provider metadata URL</Label>
            <Input id="idp-metadata" value={draft.samlMetadataUrl} onChange={(e) => set("samlMetadataUrl", e.currentTarget.value)} />
            <p className="text-hint text-tertiary">Read on save for the entity ID, sign-in address and signing certificates.</p>
          </div>
          {!draft.samlMetadataUrl && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idp-entity">IdP entity ID</Label>
                  <Input id="idp-entity" value={draft.samlIdpEntityId} onChange={(e) => set("samlIdpEntityId", e.currentTarget.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idp-sso">IdP sign-in URL</Label>
                  <Input id="idp-sso" value={draft.samlIdpSsoUrl} onChange={(e) => set("samlIdpSsoUrl", e.currentTarget.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idp-certs">Signing certificates</Label>
                <Textarea id="idp-certs" rows={4} value={draft.samlIdpCertificates} onChange={(e) => set("samlIdpCertificates", e.currentTarget.value)} />
                <p className="text-hint text-tertiary">
                  {c.samlCertificatesSet ? "Set. Paste new PEM certificates to replace them — two during a rotation." : "PEM, one or two."}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="idp-mode">Single sign-on</Label>
          <Select value={draft.ssoMode} onValueChange={(v) => set("ssoMode", v as typeof draft.ssoMode)}>
            <SelectTrigger id="idp-mode"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABEL) as IdentityConnectionDTO["ssoMode"][]).map((m) => (
                <SelectItem key={m} value={m}>{MODE_LABEL[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {draft.ssoMode === "REQUIRED" && c.ssoMode !== "REQUIRED" && (
            <p className="text-hint text-tertiary">
              Saving signs out everyone who signed in with a password, except the System Owners. Every System Owner needs
              two-step sign-in first.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-hours">A single sign-on session lasts</Label>
          <Select value={String(draft.ssoSessionHours)} onValueChange={(v) => set("ssoSessionHours", Number(v))}>
            <SelectTrigger id="idp-hours"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 4, 8, 12, 24].map((h) => (
                <SelectItem key={h} value={String(h)}>{h === 1 ? "1 hour" : `${h} hours`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        {c.configured && <Button type="button" variant="secondary" onClick={test}>Test connection</Button>}
      </div>
    </section>
  );
};

const ProvisioningPanel: React.FC<{ c: IdentityConnectionDTO }> = ({ c }) => {
  const tokens = useScimTokens(c.scimEnabled);
  const invalidate = useInvalidateIdentity();
  const [issuing, setIssuing] = React.useState(false);
  const [months, setMonths] = React.useState("12");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const toggle = async (on: boolean) => {
    const res = await withStepUpAction(() => saveIdentityConnectionAction({ scimEnabled: on, version: c.version }));
    if (res.status === ActionStatus.ERROR) showActionError(res);
    void invalidate();
  };

  const issue = async () => {
    setError(null);
    const res = await withStepUpAction(() => issueScimTokenAction(Number(months)));
    if (res.status === ActionStatus.SUCCESS && res.data) {
      setSecret(res.data.secret);
      void invalidate();
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  const live = (tokens.data ?? []).filter((t) => !t.revokedAt);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-section-title text-primary">Provisioning (SCIM)</h2>
        <div className="flex items-center gap-2">
          <Checkbox id="scim-on" checked={c.scimEnabled} onCheckedChange={(v) => void toggle(Boolean(v))} />
          <Label htmlFor="scim-on">Let the identity provider link people and push groups</Label>
        </div>
      </div>
      <p className="text-body text-tertiary">
        The identity provider links people already here by email and can block or unblock them; it never adds or
        deletes a person, or changes their name or email.
      </p>
      {c.scimEnabled && (
        <>
          <CopyField label="SCIM base URL" value={c.scimBaseUrl} />
          {tokens.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <ul className="divide-y divide-divider rounded-control border border-divider">
              {(tokens.data ?? []).length === 0 && <li className="px-4 py-3 text-body text-tertiary">No tokens yet.</li>}
              {(tokens.data ?? []).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-body">{t.publicId}</code>
                      {t.revokedAt ? <StatusBadge status="archived" label="Revoked" /> : <StatusBadge status="active" label="Live" />}
                    </div>
                    <p className="text-hint text-tertiary">
                      Issued {formatDisplayDate(t.createdAt, { style: "medium" })} ·{" "}
                      {t.expiresAt ? `expires ${formatDisplayDate(t.expiresAt, { style: "medium" })}` : "no expiry"} ·{" "}
                      {t.lastUsedAt ? `last used ${formatDisplayDate(t.lastUsedAt, { style: "medium" })}` : "never used"}
                      {t.failureCount > 0 ? ` · ${t.failureCount} failed calls` : ""}
                    </p>
                  </div>
                  {!t.revokedAt && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const res = await revokeScimTokenAction(t.id);
                        if (res.status === ActionStatus.ERROR) showActionError(res);
                        void invalidate();
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="secondary" disabled={live.length >= 2} onClick={() => setIssuing(true)}
            title={live.length >= 2 ? "Two tokens are live: revoke one first" : undefined}>
            Issue token
          </Button>
        </>
      )}

      <Dialog open={issuing} onOpenChange={(o) => { if (!o) { setIssuing(false); setSecret(null); setError(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{secret ? "Copy the token now" : "Issue a provisioning token"}</DialogTitle>
            <DialogDescription>
              {secret
                ? "It is shown this once and never again. Paste it into the identity provider, test the connection, then revoke the old token."
                : "Two tokens can be live at once, so the old one keeps working while you replace it."}
            </DialogDescription>
          </DialogHeader>
          {secret ? (
            <div className="space-y-3">
              <CopyField label="Token" value={secret} />
              <Button type="button" className="w-full" onClick={() => { setIssuing(false); setSecret(null); }}>Done</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="scim-expiry">Expires</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger id="scim-expiry"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">In 6 months</SelectItem>
                  <SelectItem value="12">In 12 months</SelectItem>
                  <SelectItem value="0">Never</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={error} />
              <Button type="button" className="w-full" onClick={issue}>Issue</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const GroupsPanel: React.FC = () => {
  const groups = useIdpGroups();
  const roles = useRoles();
  const invalidate = useInvalidateIdentity();
  const [editing, setEditing] = React.useState<IdpGroupDTO | null>(null);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const mappable = (roles.data ?? []).filter((r) => !r.systemOwner && !r.isDefault && !r.archived);

  const open = (g: IdpGroupDTO) => {
    setEditing(g);
    setPicked(new Set(g.roles.map((r) => r.id)));
    setError(null);
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const res = await withStepUpAction(() => mapIdpGroupAction(editing.id, [...picked]));
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setEditing(null);
      void invalidate();
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-section-title text-primary">Groups</h2>
      <p className="text-body text-tertiary">
        Groups the identity provider pushed, and the roles their members hold. A role given here is the identity
        provider&apos;s: it goes when the person leaves the group, unless it was also given by hand.
      </p>
      {groups.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : groups.error ? (
        <ErrorState error={groups.error} />
      ) : (groups.data ?? []).length === 0 ? (
        <p className="text-body text-tertiary">No groups pushed yet.</p>
      ) : (
        <ul className="divide-y divide-divider rounded-control border border-divider">
          {(groups.data ?? []).map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-body font-medium">{g.displayName}</p>
                <p className="text-hint text-tertiary">
                  {g.memberCount} {g.memberCount === 1 ? "member" : "members"} ·{" "}
                  {g.roles.length ? g.roles.map((r) => r.name).join(", ") : "no roles"}
                  {g.roles.some((r) => r.grantsAdministration) && " · gives IT the right to appoint administrators"}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => open(g)}>Roles</Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && !busy && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Roles for {editing?.displayName}</DialogTitle>
            <DialogDescription>
              Every member is updated at once, and signed out on their next request if their access changes — you too, if
              you are in this group.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {mappable.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <Checkbox
                  id={`map-${r.id}`}
                  checked={picked.has(r.id)}
                  onCheckedChange={(v) =>
                    setPicked((s) => {
                      const n = new Set(s);
                      if (v) n.add(r.id);
                      else n.delete(r.id);
                      return n;
                    })
                  }
                />
                <Label htmlFor={`map-${r.id}`} className="font-normal">{r.name}</Label>
              </li>
            ))}
          </ul>
          <p className="text-hint text-tertiary">The System Owner and default roles are never given by a group.</p>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
            <Button type="button" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
