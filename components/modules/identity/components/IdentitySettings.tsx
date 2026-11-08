"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
import { useDateFormatter } from "@/lib/date";
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
import { Illustration } from "@/components/illustrations";

const MODE_LABEL_KEY = {
  OFF: "identity.mode.off",
  OPTIONAL: "identity.mode.optional",
  REQUIRED: "identity.mode.required",
} as const satisfies Record<IdentityConnectionDTO["ssoMode"], string>;

const MODE_BADGE_KEY = {
  OFF: "identity.mode.badge.off",
  OPTIONAL: "identity.mode.badge.optional",
  REQUIRED: "identity.mode.badge.required",
} as const satisfies Record<IdentityConnectionDTO["ssoMode"], string>;

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const t = useTranslations("settings");
  return (
  <div className="space-y-1">
    <p className="text-hint text-tertiary">{label}</p>
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-tag bg-subtle px-2 py-1.5 text-hint">{value}</code>
      <Button type="button" variant="secondary" size="icon" aria-label={t("identity.copy", { label })} onClick={() => void navigator.clipboard?.writeText(value)}>
        <Icon icon={Copy01Icon} size="sm" />
      </Button>
    </div>
  </div>
  );
};

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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
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
      showSuccess(t("identity.sso.saved"));
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
        <h2 className="text-section-title text-primary">{t("identity.sso.title")}</h2>
        <StatusBadge status={c.ssoMode === "OFF" ? "inactive" : "active"} label={t(MODE_BADGE_KEY[c.ssoMode])} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="idp-provider">{t("identity.sso.provider")}</Label>
          <Select value={draft.provider} onValueChange={(v) => set("provider", v as typeof draft.provider)}>
            <SelectTrigger id="idp-provider"><SelectValue /></SelectTrigger>
            <SelectContent>
              {/* i18n-exempt: brand name */}
              <SelectItem value="OKTA">Okta</SelectItem>
              {/* i18n-exempt: brand name */}
              <SelectItem value="ENTRA">Microsoft Entra ID</SelectItem>
              <SelectItem value="OTHER">{t("identity.sso.providerOther")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-protocol">{t("identity.sso.protocol")}</Label>
          <Select value={draft.protocol} onValueChange={(v) => set("protocol", v as typeof draft.protocol)}>
            <SelectTrigger id="idp-protocol"><SelectValue /></SelectTrigger>
            <SelectContent>
              {/* i18n-exempt: protocol name */}
              <SelectItem value="OIDC">OpenID connect</SelectItem>
              <SelectItem value="SAML">SAML 2.0</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {draft.protocol === "OIDC" ? (
        <div className="space-y-4">
          <CopyField label={t("identity.sso.redirectUri")} value={c.redirectUri} />
          <div className="space-y-2">
            <Label htmlFor="idp-issuer">{t("identity.sso.issuer")}</Label>
            <Input id="idp-issuer" value={draft.issuer} onChange={(e) => set("issuer", e.currentTarget.value)} />
            <p className="text-hint text-tertiary">
              {draft.provider === "ENTRA" ? t("identity.sso.issuerHintEntra") : t("identity.sso.issuerHintOkta")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idp-client-id">{t("identity.sso.clientId")}</Label>
              <Input id="idp-client-id" value={draft.clientId} onChange={(e) => set("clientId", e.currentTarget.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idp-client-secret">{t("identity.sso.clientSecret")}</Label>
              <Input
                id="idp-client-secret"
                type="password"
                autoComplete="off"
                value={draft.clientSecret}
                onChange={(e) => set("clientSecret", e.currentTarget.value)}
              />
              <p className="text-hint text-tertiary">{c.clientSecretSet ? t("identity.sso.secretSet") : t("identity.sso.secretNotSet")}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <CopyField label={t("identity.sso.entityId")} value={c.samlEntityId} />
          <CopyField label={t("identity.sso.acsUrl")} value={c.samlAcsUrl} />
          <div className="space-y-2">
            <Label htmlFor="idp-metadata">{t("identity.sso.metadataUrl")}</Label>
            <Input id="idp-metadata" value={draft.samlMetadataUrl} onChange={(e) => set("samlMetadataUrl", e.currentTarget.value)} />
            <p className="text-hint text-tertiary">{t("identity.sso.metadataHint")}</p>
          </div>
          {!draft.samlMetadataUrl && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idp-entity">{t("identity.sso.idpEntityId")}</Label>
                  <Input id="idp-entity" value={draft.samlIdpEntityId} onChange={(e) => set("samlIdpEntityId", e.currentTarget.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idp-sso">{t("identity.sso.idpSsoUrl")}</Label>
                  <Input id="idp-sso" value={draft.samlIdpSsoUrl} onChange={(e) => set("samlIdpSsoUrl", e.currentTarget.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idp-certs">{t("identity.sso.certificates")}</Label>
                <Textarea id="idp-certs" rows={4} value={draft.samlIdpCertificates} onChange={(e) => set("samlIdpCertificates", e.currentTarget.value)} />
                <p className="text-hint text-tertiary">
                  {c.samlCertificatesSet ? t("identity.sso.certificatesSet") : t("identity.sso.certificatesHint")}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="idp-mode">{t("identity.sso.title")}</Label>
          <Select value={draft.ssoMode} onValueChange={(v) => set("ssoMode", v as typeof draft.ssoMode)}>
            <SelectTrigger id="idp-mode"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABEL_KEY) as IdentityConnectionDTO["ssoMode"][]).map((m) => (
                <SelectItem key={m} value={m}>{t(MODE_LABEL_KEY[m])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {draft.ssoMode === "REQUIRED" && c.ssoMode !== "REQUIRED" && (
            <p className="text-hint text-tertiary">
              {t("identity.sso.requiredWarning")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-hours">{t("identity.sso.sessionLasts")}</Label>
          <Select value={String(draft.ssoSessionHours)} onValueChange={(v) => set("ssoSessionHours", Number(v))}>
            <SelectTrigger id="idp-hours"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 4, 8, 12, 24].map((h) => (
                <SelectItem key={h} value={String(h)}>{tCommon("time.hours", { count: h })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={busy}>{busy ? tCommon("actions.saving") : tCommon("actions.save")}</Button>
        {c.configured && <Button type="button" variant="secondary" onClick={test}>{t("identity.sso.test")}</Button>}
      </div>
    </section>
  );
};

const ProvisioningPanel: React.FC<{ c: IdentityConnectionDTO }> = ({ c }) => {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
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

  const live = (tokens.data ?? []).filter((token) => !token.revokedAt);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-section-title text-primary">{t("identity.scim.title")}</h2>
        <div className="flex items-center gap-2">
          <Checkbox id="scim-on" checked={c.scimEnabled} onCheckedChange={(v) => void toggle(Boolean(v))} />
          <Label htmlFor="scim-on">{t("identity.scim.enable")}</Label>
        </div>
      </div>
      <p className="text-body text-tertiary">
        {t("identity.scim.description")}
      </p>
      {c.scimEnabled && (
        <>
          <CopyField label={t("identity.scim.baseUrl")} value={c.scimBaseUrl} />
          {tokens.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <ul className="divide-y divide-divider rounded-control border border-divider">
              {(tokens.data ?? []).length === 0 && <li className="px-4 py-3 text-body text-tertiary">{t("identity.scim.noTokens")}</li>}
              {(tokens.data ?? []).map((token) => (
                <li key={token.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-body">{token.publicId}</code>
                      {token.revokedAt ? (
                        <StatusBadge status="archived" label={t("identity.scim.revoked")} />
                      ) : (
                        <StatusBadge status="active" label={t("identity.scim.live")} />
                      )}
                    </div>
                    <p className="text-hint text-tertiary">
                      {[
                        t("identity.scim.issued", { date: formatDisplayDate(token.createdAt, { style: "medium" }) }),
                        token.expiresAt
                          ? t("identity.scim.expires", { date: formatDisplayDate(token.expiresAt, { style: "medium" }) })
                          : t("identity.scim.noExpiry"),
                        token.lastUsedAt
                          ? t("identity.scim.lastUsed", { date: formatDisplayDate(token.lastUsedAt, { style: "medium" }) })
                          : t("identity.scim.neverUsed"),
                        ...(token.failureCount > 0 ? [t("identity.scim.failedCalls", { count: token.failureCount })] : []),
                      ].join(" · ")}
                    </p>
                  </div>
                  {!token.revokedAt && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const res = await revokeScimTokenAction(token.id);
                        if (res.status === ActionStatus.ERROR) showActionError(res);
                        void invalidate();
                      }}
                    >
                      {t("identity.scim.revoke")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="secondary" disabled={live.length >= 2} onClick={() => setIssuing(true)}
            title={live.length >= 2 ? t("identity.scim.twoLive") : undefined}>
            {t("identity.scim.issueToken")}
          </Button>
        </>
      )}

      <Dialog open={issuing} onOpenChange={(o) => { if (!o) { setIssuing(false); setSecret(null); setError(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{secret ? t("identity.scim.copyNow") : t("identity.scim.issueTitle")}</DialogTitle>
            <DialogDescription>
              {secret ? t("identity.scim.shownOnce") : t("identity.scim.twoAtOnce")}
            </DialogDescription>
          </DialogHeader>
          {secret ? (
            <div className="space-y-3">
              <CopyField label={t("identity.scim.token")} value={secret} />
              <Button type="button" className="w-full" onClick={() => { setIssuing(false); setSecret(null); }}>{tCommon("actions.done")}</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="scim-expiry">{t("identity.scim.expiry")}</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger id="scim-expiry"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">{t("identity.scim.inMonths", { count: 6 })}</SelectItem>
                  <SelectItem value="12">{t("identity.scim.inMonths", { count: 12 })}</SelectItem>
                  <SelectItem value="0">{t("identity.scim.never")}</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={error} />
              <Button type="button" className="w-full" onClick={issue}>{t("identity.scim.issue")}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const GroupsPanel: React.FC = () => {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
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
      <h2 className="text-section-title text-primary">{t("identity.groups.title")}</h2>
      <p className="text-body text-tertiary">
        {t("identity.groups.description")}
      </p>
      {groups.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : groups.error ? (
        <ErrorState error={groups.error} />
      ) : (groups.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Illustration scene="job-families" />
          <p className="text-body text-tertiary">{t("identity.groups.empty")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-divider rounded-control border border-divider">
          {(groups.data ?? []).map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-body font-medium">{g.displayName}</p>
                <p className="text-hint text-tertiary">
                  {[
                    t("identity.groups.members", { count: g.memberCount }),
                    g.roles.length ? g.roles.map((r) => r.name).join(", ") : t("identity.groups.noRoles"),
                    ...(g.roles.some((r) => r.grantsAdministration) ? [t("identity.groups.grantsAdministration")] : []),
                  ].join(" · ")}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => open(g)}>{t("identity.groups.roles")}</Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && !busy && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("identity.groups.dialogTitle", { name: editing?.displayName ?? "" })}</DialogTitle>
            <DialogDescription>
              {t("identity.groups.dialogDescription")}
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
          <p className="text-hint text-tertiary">{t("identity.groups.neverGiven")}</p>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={busy}>{tCommon("actions.cancel")}</Button>
            <Button type="button" onClick={save} disabled={busy}>{busy ? tCommon("actions.saving") : tCommon("actions.save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
