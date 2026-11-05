"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Building03Icon, Cancel01Icon, Shield01Icon, UserGroupIcon, UserIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { showError } from "@/lib/errors/errorToast";
import type {
  PeopleView,
  PeopleViewShare,
  ShareGrantee,
  ShareGranteeType,
  SharePermission,
  SharePreview,
} from "@/models/peopleView";
import {
  usePeopleViewMutations,
  usePeopleViewShares,
  useSharePreview,
} from "@/components/modules/organization/components/PeopleViews/hooks/usePeopleViews";
import { NodRing } from "@/components/desact/nod";

/** A grantee picked in the dialog and not shared yet. */
type PendingGrantee = ShareGrantee & { name: string };

type OrganizationT = ReturnType<typeof useTranslations<"organization">>;

const GRANTEE_TYPES: ShareGranteeType[] = ["PERSON", "TEAM", "DEPARTMENT", "ROLE"];

const PERMISSIONS: SharePermission[] = ["VIEW", "EDIT"];

const REFERENCE_SOURCE = { TEAM: "teams", DEPARTMENT: "departments", ROLE: "roles" } as const;

const GRANTEE_ICON: Record<ShareGranteeType, React.ReactNode> = {
  PERSON: <Icon icon={UserIcon} size="sm" className="text-tertiary" />,
  TEAM: <Icon icon={UserGroupIcon} size="sm" className="text-tertiary" />,
  DEPARTMENT: <Icon icon={Building03Icon} size="sm" className="text-tertiary" />,
  ROLE: <Icon icon={Shield01Icon} size="sm" className="text-tertiary" />,
};

const personName = (u: PickedUser, unknown: string): string =>
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || unknown;

/**
 * The sentences of the warning before sharing — "3 people won't see Salary". Exported for the test:
 * the wording is the feature here, since the owner decides on it.
 */
export function previewSentences(preview: SharePreview, t: OrganizationT): string[] {
  const lines: string[] = [];
  if (preview.noPeopleAccessCount > 0) {
    lines.push(t("views.share.noPeopleAccess", { count: preview.noPeopleAccessCount }));
  }
  for (const field of preview.hiddenFields) {
    const others = field.peopleCount - field.sampleNames.length;
    const listed = field.sampleNames.join(", ");
    if (!listed) {
      lines.push(t("views.share.hiddenField", { count: field.peopleCount, field: field.label }));
      continue;
    }
    const names = others > 0 ? t("views.share.namesAndMore", { names: listed, others }) : listed;
    lines.push(t("views.share.hiddenFieldNamed", { count: field.peopleCount, field: field.label, names }));
  }
  return lines;
}

/**
 * Share a saved view with people, teams, departments or roles (`technical_documentation/PEOPLE_TABLE.md` § "Saved views and sharing").
 *
 * Owner only — the panel offers it on the owner's own views, and the backend refuses anybody else.
 * Every recipient sees the view under their own access; the warning says, before anything is shared,
 * who will be missing which column. One primary action: **Share**.
 */
export function ShareViewDialog({
  view,
  onClose,
}: {
  view: PeopleView | null;
  onClose: () => void;
}) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const viewId = view?.id ?? null;
  const [type, setType] = useState<ShareGranteeType>("PERSON");
  const [pending, setPending] = useState<PendingGrantee[]>([]);
  const [removing, setRemoving] = useState<PeopleViewShare | null>(null);

  const { data: shares = [], isLoading: sharesLoading } = usePeopleViewShares(viewId);
  const mutations = usePeopleViewMutations();

  const previewGrantees = useMemo(
    () => pending.map((p) => ({ granteeType: p.granteeType, granteeId: p.granteeId })),
    [pending],
  );
  const { data: preview, isFetching: previewLoading } = useSharePreview(viewId, previewGrantees);

  const reference = useReferenceOptions(type === "PERSON" ? undefined : REFERENCE_SOURCE[type], type !== "PERSON");

  const add = (granteeType: ShareGranteeType, granteeId: string, name: string) => {
    setPending((prev) =>
      prev.some((p) => p.granteeType === granteeType && p.granteeId === granteeId)
        ? prev
        : [...prev, { granteeType, granteeId, name, permission: "VIEW" }],
    );
  };

  const close = () => {
    setPending([]);
    setType("PERSON");
    mutations.share.reset();
    onClose();
  };

  const submit = () => {
    if (!viewId || !pending.length) return;
    mutations.share.mutate(
      { viewId, grantees: pending.map(({ granteeType, granteeId, permission }) => ({ granteeType, granteeId, permission })) },
      { onSuccess: () => setPending([]) },
    );
  };

  const changePermission = (share: PeopleViewShare, permission: SharePermission) => {
    if (!viewId || permission === share.permission) return;
    mutations.updateShare.mutate({ viewId, shareId: share.id, permission }, { onError: showError });
  };

  const sentences = preview && pending.length ? previewSentences(preview, t) : [];

  return (
    <>
      <Dialog open={view !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("views.share.title", { name: view?.name ?? "" })}</DialogTitle>
            <DialogDescription>{t("views.share.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Select value={type} onValueChange={(v) => setType(v as ShareGranteeType)}>
                <SelectTrigger className="h-9 w-36" aria-label={t("views.share.shareWith")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRANTEE_TYPES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {t(`views.share.granteeType.${g}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-w-0 flex-1">
                {type === "PERSON" ? (
                  <UserPickerField
                    value={null}
                    onChange={(u) => u && add("PERSON", u.id, personName(u, tCommon("values.unknown")))}
                    placeholder={t("views.share.selectPerson")}
                    allowClear={false}
                  />
                ) : (
                  <SearchableSelect
                    options={reference.options.map((o) => ({ value: o.id, label: o.label }))}
                    value={null}
                    clearable={false}
                    placeholder={reference.isLoading ? tCommon("states.loading") : t("views.share.selectGrantee", { type })}
                    onChange={(id) => {
                      const option = reference.options.find((o) => o.id === id);
                      if (option) add(type, option.id, option.label);
                    }}
                  />
                )}
              </div>
            </div>

            {pending.length ? (
              <ul className="flex flex-col gap-1" aria-label={t("views.share.toShare")}>
                {pending.map((p) => (
                  <li key={`${p.granteeType}:${p.granteeId}`} className="flex items-center gap-2 py-1">
                    {GRANTEE_ICON[p.granteeType]}
                    <span className="min-w-0 flex-1 truncate text-body">{p.name}</span>
                    <PermissionSelect
                      value={p.permission}
                      label={t("views.share.permissionLabel", { name: p.name })}
                      onChange={(permission) =>
                        setPending((prev) => prev.map((q) => (q === p ? { ...q, permission } : q)))
                      }
                    />
                    <Button type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("views.share.doNotShare", { name: p.name })}
                      onClick={() => setPending((prev) => prev.filter((q) => q !== p))}
                    >
                      <Icon icon={Cancel01Icon} size="sm" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}

            {pending.length ? (
              <div className="rounded-tag bg-subtle px-3 py-2 text-hint text-tertiary" aria-live="polite">
                {previewLoading && !preview ? (
                  <span>{t("views.share.checking")}</span>
                ) : sentences.length ? (
                  <ul className="flex flex-col gap-1">
                    {sentences.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : preview ? (
                  <span>
                    {preview.recipientCount === 0
                      ? t("views.share.nobody")
                      : t("views.share.everyColumn", { count: preview.recipientCount })}
                  </span>
                ) : null}
              </div>
            ) : null}

            <FormError message={mutations.share.error?.message} />

            <section className="flex flex-col gap-1">
              <h3 className="text-hint font-medium text-tertiary">{t("views.share.sharedWith")}</h3>
              {sharesLoading ? (
                <div className="flex justify-center py-1"><NodRing size="sm" /></div>
              ) : shares.length === 0 ? (
                <p className="py-1 text-body text-tertiary">{t("views.share.notShared")}</p>
              ) : (
                <ul className="flex flex-col gap-1" aria-label={t("views.share.sharedWith")}>
                  {shares.map((s) => {
                    const name = s.granteeName ?? t("views.share.removedGrantee", { type: s.granteeType });
                    return (
                      <li key={s.id} className="flex items-center gap-2 py-1">
                        {GRANTEE_ICON[s.granteeType]}
                        <span
                          className={`min-w-0 flex-1 truncate text-body ${s.granteeName ? "" : "text-tertiary"}`}
                        >
                          {name}
                        </span>
                        <PermissionSelect
                          value={s.permission}
                          label={t("views.share.permissionLabel", { name })}
                          onChange={(permission) => changePermission(s, permission)}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setRemoving(s)}>
                          {tCommon("actions.remove")}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={close}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" onClick={submit} disabled={!pending.length || mutations.share.isPending}>
              {t("views.share.share")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        isOpen={removing !== null}
        title={t("views.share.removeTitle")}
        description={t("views.share.removeDescription", {
          name: removing?.granteeName ?? t("views.share.thisGrantee"),
          view: view?.name ?? "",
        })}
        confirmLabel={tCommon("actions.remove")}
        isLoading={mutations.unshare.isPending}
        errorMessage={mutations.unshare.error?.message}
        onCancelAction={() => {
          mutations.unshare.reset();
          setRemoving(null);
        }}
        onConfirmAction={() => {
          if (!viewId || !removing) return;
          mutations.unshare.mutate(
            { viewId, shareId: removing.id },
            { onSuccess: () => setRemoving(null) },
          );
        }}
      />
    </>
  );
}

function PermissionSelect({
  value,
  label,
  onChange,
}: {
  value: SharePermission;
  label: string;
  onChange: (permission: SharePermission) => void;
}) {
  const t = useTranslations("organization");
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SharePermission)}>
      <SelectTrigger className="h-8 w-28 text-hint" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERMISSIONS.map((p) => (
          <SelectItem key={p} value={p}>
            {t(`views.share.permission.${p}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
