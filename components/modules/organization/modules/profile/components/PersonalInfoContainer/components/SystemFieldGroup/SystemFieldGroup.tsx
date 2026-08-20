"use client";

import * as React from "react";
import { useState } from "react";
import { useSWRConfig } from "swr";

import type { User } from "@/models/user/User";
import { isReferenceField, type FieldDTO, type ReferenceValueSource } from "@/models/user/fields";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { formatEmploymentType } from "@/models/user/employmentType";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAction } from "@/components/modules/organization/modules/profile/actions/updateUserAction";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import UserChip from "@/components/ui/UserChip/UserChip";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import {
  useAssignUserRolesAction,
} from "@/components/modules/settings/modules/roles/hooks/Role/useAssignUserRolesAction/useAssignUserRolesAction";
import {
  AssignRolesModal,
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesModal";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";

/**
 * System fields that already live somewhere better on this page: the header shows the name badge
 * and the status, and record timestamps are table columns, not facts about a person.
 */
export const PROFILE_HIDDEN_SYSTEM_FIELDS = new Set([
  "sys:status",
  "sys:created_at",
  "sys:updated_at",
]);

/** System fields with a write path from the profile. Everything else here is read-only. */
const EDITABLE_SYSTEM_FIELDS = new Set([
  "sys:first_name",
  "sys:last_name",
  "sys:email",
  "sys:hire_date",
  "sys:probation_end",
  "sys:manager",
  "sys:job",
  "sys:office",
  "sys:legal_entity",
]);

/** Sentinel for "no value" in a Select — Radix cannot hold an empty string as an item value. */
const NONE = "__none__";

const formatDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : null);

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  hireDate: string;
  probationEnd: string;
  manager: PickedUser | null;
  jobId: string;
  officeId: string;
  legalEntityId: string;
};

const draftOf = (user: User): Draft => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  email: user.email ?? "",
  hireDate: formatDate(user.hireDate) ?? "",
  probationEnd: formatDate(user.probationEnd) ?? "",
  manager: user.manager ? { id: user.manager.id, firstName: user.manager.name } : null,
  jobId: user.jobId ?? NONE,
  officeId: user.office?.id ?? NONE,
  legalEntityId: user.legalEntity?.id ?? NONE,
});

/** `NONE` back to the wire value: `null` clears the association. */
const idOrNull = (value: string): string | null => (value === NONE ? null : value);

type Props = {
  user: User;
  fields: FieldDTO[];
  /** PEOPLE.PROFILE EDIT on this person. Field-level rights arrive with the field-access pass. */
  canEdit: boolean;
};

/**
 * One section of built-in fields, rendered from the server catalogue rather than a hand-written
 * list — adding a field to `FieldRegistry` makes it appear here without touching this file.
 */
export const SystemFieldGroup: React.FC<Props> = ({ user, fields, canEdit }) => {
  const { mutate } = useSWRConfig();

  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftOf(user));

  const visible = fields.filter((f) => !PROFILE_HIDDEN_SYSTEM_FIELDS.has(f.id));
  const editableHere = visible.filter((f) => EDITABLE_SYSTEM_FIELDS.has(f.id));
  const canEditSection = canEdit && editableHere.length > 0;

  if (visible.length === 0) return null;

  const initial = draftOf(user);
  const dirty =
    draft.firstName !== initial.firstName ||
    draft.lastName !== initial.lastName ||
    draft.email !== initial.email ||
    draft.hireDate !== initial.hireDate ||
    draft.probationEnd !== initial.probationEnd ||
    (draft.manager?.id ?? null) !== (initial.manager?.id ?? null) ||
    draft.jobId !== initial.jobId ||
    draft.officeId !== initial.officeId ||
    draft.legalEntityId !== initial.legalEntityId;

  const cancel = () => {
    setDraft(draftOf(user));
    setSaveError(null);
    setIsEdit(false);
  };

  const save = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await updateUserAction({
        userId: user.id,
        firstName: draft.firstName !== initial.firstName ? draft.firstName : undefined,
        lastName: draft.lastName !== initial.lastName ? draft.lastName : undefined,
        email: draft.email !== initial.email ? draft.email : undefined,
        hireDate: draft.hireDate !== initial.hireDate ? draft.hireDate : undefined,
        probationEnd:
          draft.probationEnd !== initial.probationEnd ? draft.probationEnd : undefined,
        managerId:
          (draft.manager?.id ?? null) !== (initial.manager?.id ?? null)
            ? draft.manager?.id ?? null
            : undefined,
        jobId: draft.jobId !== initial.jobId ? idOrNull(draft.jobId) : undefined,
        officeId: draft.officeId !== initial.officeId ? idOrNull(draft.officeId) : undefined,
        legalEntityId:
          draft.legalEntityId !== initial.legalEntityId
            ? idOrNull(draft.legalEntityId)
            : undefined,
      });

      if (res.status === ActionStatus.SUCCESS) {
        setIsEdit(false);
        await mutate(`/api/users/${user.id}`);
      } else {
        setSaveError(res.errorMessage ?? "Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const editorFor = (fieldId: string): React.ReactNode => {
    switch (fieldId) {
      case "sys:first_name":
        return (
          <Input
            value={draft.firstName}
            onChange={(e) => {
              // Snapshot before the updater runs: React nulls `currentTarget` once the
              // handler returns, and the functional setState body executes after that.
              const value = e.target.value;
              setDraft((d) => ({ ...d, firstName: value }));
            }}
          />
        );
      case "sys:last_name":
        return (
          <Input
            value={draft.lastName}
            onChange={(e) => {
              // Snapshot before the updater runs: React nulls `currentTarget` once the
              // handler returns, and the functional setState body executes after that.
              const value = e.target.value;
              setDraft((d) => ({ ...d, lastName: value }));
            }}
          />
        );
      case "sys:email":
        return (
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => {
              // Snapshot before the updater runs: React nulls `currentTarget` once the
              // handler returns, and the functional setState body executes after that.
              const value = e.target.value;
              setDraft((d) => ({ ...d, email: value }));
            }}
          />
        );
      case "sys:hire_date":
        return (
          <Input
            type="date"
            value={draft.hireDate}
            onChange={(e) => {
              // Snapshot before the updater runs: React nulls `currentTarget` once the
              // handler returns, and the functional setState body executes after that.
              const value = e.target.value;
              setDraft((d) => ({ ...d, hireDate: value }));
            }}
          />
        );
      case "sys:probation_end":
        return (
          <Input
            type="date"
            value={draft.probationEnd}
            onChange={(e) => {
              // Snapshot before the updater runs: React nulls `currentTarget` once the
              // handler returns, and the functional setState body executes after that.
              const value = e.target.value;
              setDraft((d) => ({ ...d, probationEnd: value }));
            }}
          />
        );
      case "sys:manager":
        return (
          <UserPickerField
            value={draft.manager}
            onChange={(manager) => setDraft((d) => ({ ...d, manager }))}
            placeholder="No manager"
          />
        );
      case "sys:job":
        return (
          <ReferenceSelect
            source="jobs"
            value={draft.jobId}
            placeholder="No job"
            onChange={(jobId) => setDraft((d) => ({ ...d, jobId }))}
          />
        );
      case "sys:office":
        return (
          <ReferenceSelect
            source="offices"
            value={draft.officeId}
            placeholder="No office"
            onChange={(officeId) => setDraft((d) => ({ ...d, officeId }))}
          />
        );
      case "sys:legal_entity":
        return (
          <ReferenceSelect
            source="legalEntities"
            value={draft.legalEntityId}
            placeholder="No legal entity"
            onChange={(legalEntityId) => setDraft((d) => ({ ...d, legalEntityId }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {canEditSection && (
        <div className="mb-3 flex items-center justify-end gap-3">
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}

          {isEdit ? (
            <>
              <Button variant="outline" size="sm" onClick={cancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={!dirty || isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft(draftOf(user));
                setSaveError(null);
                setIsEdit(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      )}

      <div className="divide-y divide-brown-200 border-t border-brown-200">
        {visible.map((field) => {
          const editing = isEdit && EDITABLE_SYSTEM_FIELDS.has(field.id);

          return (
            <div
              key={field.id}
              className="grid grid-cols-[minmax(14rem,18rem)_1fr] items-center gap-5 py-4"
            >
              <div className="text-sm text-muted-foreground">{field.label}</div>
              <div className="text-sm text-foreground">
                {editing ? editorFor(field.id) : <SystemFieldValue user={user} field={field} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Picker for a single-valued reference, backed by the shared catalogue hook. */
const ReferenceSelect: React.FC<{
  source: ReferenceValueSource;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ source, value, placeholder, onChange }) => {
  const { options, isLoading } = useReferenceOptions(source);

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading…" : placeholder}/>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={NONE}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const NotSet = () => <span className="text-muted-foreground italic">Not set</span>;

const RefChips: React.FC<{ values?: { id: string; name: string }[] }> = ({ values }) =>
  values?.length ? (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <Badge key={v.id} variant="secondary">{v.name}</Badge>
      ))}
    </div>
  ) : (
    <NotSet />
  );

/**
 * Roles are the one system field with a write path that is not a plain input: the same
 * `AssignRolesModal` the roles settings page uses is reused here, so role management lives on the
 * person as well as in settings. Gated on PROFILE MANAGE — Java enforces it regardless.
 */
const RolesCell: React.FC<{ user: User }> = ({ user }) => {
  const { mutate } = useSWRConfig();
  const [isOpen, setIsOpen] = useState(false);
  const { data: allRoles } = useRoles();
  const assignRoles = useAssignUserRolesAction();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RefChips values={user.roles}/>

      <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          Manage
        </Button>
      </PermissionGate>

      <AssignRolesModal
        isOpen={isOpen}
        user={isOpen ? user : null}
        allRoles={allRoles ?? []}
        isLoading={assignRoles.isPending}
        errorMessage={
          assignRoles.error instanceof Error ? assignRoles.error.message : undefined
        }
        onCancelAction={() => setIsOpen(false)}
        onApplyAction={async (userId, roleIds) => {
          await assignRoles.mutateAsync({
            userId,
            roleIds,
            currentRoleIds: (user.roles ?? []).map((role) => role.id),
          });
          setIsOpen(false);
          await mutate(`/api/users/${user.id}`);
        }}
      />
    </div>
  );
};

/** Reads a system field's value off the user object. The one place that knows the mapping. */
const SystemFieldValue: React.FC<{ user: User; field: FieldDTO }> = ({ user, field }) => {
  switch (field.id) {
    case "sys:first_name":
      return <>{user.firstName || <NotSet />}</>;
    case "sys:last_name":
      return <>{user.lastName || <NotSet />}</>;
    case "sys:email":
      return <>{user.email || <NotSet />}</>;
    case "sys:hire_date":
      return <>{formatDate(user.hireDate) ?? <NotSet />}</>;
    case "sys:employment_type":
      return <>{formatEmploymentType(user.employmentType) ?? <NotSet />}</>;
    case "sys:probation_end":
      return <>{formatDate(user.probationEnd) ?? <NotSet />}</>;
    case "sys:termination_date":
      return <>{formatDate(user.terminationDate) ?? <NotSet />}</>;
    case "sys:job":
      return <>{user.jobName || <NotSet />}</>;
    // Not in EDITABLE_SYSTEM_FIELDS on purpose: the grade follows the position, so it changes by
    // changing the job, never on its own.
    case "sys:level":
      return <>{user.level?.name || <NotSet />}</>;
    case "sys:department":
      return <>{user.department?.name || <NotSet />}</>;
    case "sys:office":
      return <>{user.office?.name || <NotSet />}</>;
    case "sys:legal_entity":
      return <>{user.legalEntity?.name || <NotSet />}</>;
    case "sys:team":
      return <RefChips values={user.teams} />;
    case "sys:role":
      return <RolesCell user={user}/>;
    case "sys:calendar":
      return (
        <RefChips
          values={user.calendars?.map((c) => ({ id: c.id, name: `${c.name} · ${c.year}` }))}
        />
      );
    case "sys:manager":
      return user.manager ? (
        <UserChip
          name={user.manager.name}
          href={`/organization/people/${user.manager.id}/personal`}
        />
      ) : (
        <NotSet />
      );
    default:
      // A field registered on the backend that nothing here knows how to read yet.
      return isReferenceField(field) ? <NotSet /> : <NotSet />;
  }
};
