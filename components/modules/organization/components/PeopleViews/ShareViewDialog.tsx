"use client";

import React, { useMemo, useState } from "react";
import { Building2, Shield, User, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
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

/** A grantee picked in the dialog and not shared yet. */
type PendingGrantee = ShareGrantee & { name: string };

const GRANTEE_TYPES: { value: ShareGranteeType; label: string }[] = [
  { value: "PERSON", label: "Person" },
  { value: "TEAM", label: "Team" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "ROLE", label: "Role" },
];

const PERMISSIONS: { value: SharePermission; label: string }[] = [
  { value: "VIEW", label: "Can View" },
  { value: "EDIT", label: "Can Edit" },
];

const REFERENCE_SOURCE = { TEAM: "teams", DEPARTMENT: "departments", ROLE: "roles" } as const;

const GRANTEE_ICON: Record<ShareGranteeType, React.ReactNode> = {
  PERSON: <User className="h-4 w-4 text-muted-foreground" />,
  TEAM: <Users className="h-4 w-4 text-muted-foreground" />,
  DEPARTMENT: <Building2 className="h-4 w-4 text-muted-foreground" />,
  ROLE: <Shield className="h-4 w-4 text-muted-foreground" />,
};

const TYPE_LABEL: Record<ShareGranteeType, string> = {
  PERSON: "Person",
  TEAM: "Team",
  DEPARTMENT: "Department",
  ROLE: "Role",
};

const personName = (u: PickedUser): string =>
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "Unknown";

const people = (n: number) => (n === 1 ? "1 person" : `${n} people`);

/**
 * The sentences of the warning before sharing — "3 people won't see Salary". Exported for the test:
 * the wording is the feature here, since the owner decides on it.
 */
export function previewSentences(preview: SharePreview): string[] {
  const lines: string[] = [];
  if (preview.noPeopleAccessCount > 0) {
    lines.push(`${people(preview.noPeopleAccessCount)} can't open the People table and won't see this view at all.`);
  }
  for (const field of preview.hiddenFields) {
    const others = field.peopleCount - field.sampleNames.length;
    const names = field.sampleNames.join(", ") + (others > 0 ? ` and ${others} more` : "");
    lines.push(`${people(field.peopleCount)} won't see ${field.label}${names ? ` (${names})` : ""}.`);
  }
  return lines;
}

/**
 * Share a saved view with people, teams, departments or roles (PLATFORM_PLAN 4.7).
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

  const sentences = preview && pending.length ? previewSentences(preview) : [];

  return (
    <>
      <Dialog open={view !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share “{view?.name}”</DialogTitle>
            <DialogDescription>
              Everyone sees this view under their own access. A column somebody may not see is hidden for them.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Select value={type} onValueChange={(v) => setType(v as ShareGranteeType)}>
                <SelectTrigger className="h-9 w-36" aria-label="Share With">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRANTEE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-w-0 flex-1">
                {type === "PERSON" ? (
                  <UserPickerField
                    value={null}
                    onChange={(u) => u && add("PERSON", u.id, personName(u))}
                    placeholder="Select a person"
                    allowClear={false}
                  />
                ) : (
                  <SearchableSelect
                    options={reference.options.map((o) => ({ value: o.id, label: o.label }))}
                    value={null}
                    clearable={false}
                    placeholder={reference.isLoading ? "Loading…" : `Select a ${TYPE_LABEL[type].toLowerCase()}`}
                    onChange={(id) => {
                      const option = reference.options.find((o) => o.id === id);
                      if (option) add(type, option.id, option.label);
                    }}
                  />
                )}
              </div>
            </div>

            {pending.length ? (
              <ul className="flex flex-col gap-1" aria-label="To Share">
                {pending.map((p) => (
                  <li key={`${p.granteeType}:${p.granteeId}`} className="flex items-center gap-2 py-1">
                    {GRANTEE_ICON[p.granteeType]}
                    <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                    <PermissionSelect
                      value={p.permission}
                      label={`${p.name} Permission`}
                      onChange={(permission) =>
                        setPending((prev) => prev.map((q) => (q === p ? { ...q, permission } : q)))
                      }
                    />
                    <Button type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Do Not Share With ${p.name}`}
                      onClick={() => setPending((prev) => prev.filter((q) => q !== p))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}

            {pending.length ? (
              <div className="rounded-md bg-brown-50 px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
                {previewLoading && !preview ? (
                  <span>Checking who will see what…</span>
                ) : sentences.length ? (
                  <ul className="flex flex-col gap-1">
                    {sentences.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : preview ? (
                  <span>
                    {preview.recipientCount === 0
                      ? "Nobody is in this group yet."
                      : `${people(preview.recipientCount)} will see every column of this view.`}
                  </span>
                ) : null}
              </div>
            ) : null}

            <FormError message={mutations.share.error?.message} />

            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-medium text-muted-foreground">Shared With</h3>
              {sharesLoading ? (
                <p className="py-1 text-sm text-muted-foreground">Loading…</p>
              ) : shares.length === 0 ? (
                <p className="py-1 text-sm text-muted-foreground">Not shared with anyone yet.</p>
              ) : (
                <ul className="flex flex-col gap-1" aria-label="Shared With">
                  {shares.map((s) => {
                    const name = s.granteeName ?? `Removed ${TYPE_LABEL[s.granteeType]}`;
                    return (
                      <li key={s.id} className="flex items-center gap-2 py-1">
                        {GRANTEE_ICON[s.granteeType]}
                        <span
                          className={`min-w-0 flex-1 truncate text-sm ${s.granteeName ? "" : "text-muted-foreground"}`}
                        >
                          {name}
                        </span>
                        <PermissionSelect
                          value={s.permission}
                          label={`${name} Permission`}
                          onChange={(permission) => changePermission(s, permission)}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setRemoving(s)}>
                          Remove
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
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={!pending.length || mutations.share.isPending}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        isOpen={removing !== null}
        title="Remove Access"
        description={`${removing?.granteeName ?? "This grantee"} will no longer see “${view?.name ?? ""}”.`}
        confirmLabel="Remove"
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
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SharePermission)}>
      <SelectTrigger className="h-8 w-28 text-xs" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERMISSIONS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
