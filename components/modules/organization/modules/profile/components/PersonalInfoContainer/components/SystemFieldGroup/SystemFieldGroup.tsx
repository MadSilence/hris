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
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDisplayDate } from "@/lib/date";
import { NONE_LABEL, NONE_VALUE } from "@/models/select";
import {
  ProfileSectionCard,
  SectionEditButton,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/ProfileSectionCard";

/**
 * System fields that already live somewhere better on this page: the header shows the name badge
 * and the status, and record timestamps are table columns, not facts about a person.
 */
export const PROFILE_HIDDEN_SYSTEM_FIELDS = new Set([
  "sys:status",
  "sys:created_at",
  "sys:updated_at",
]);

/**
 * System fields this form knows how to edit — a statement about the editors below, not about
 * permissions. Whether the caller may write one is `fieldAccess`, resolved by the server per field
 * and per person; a field absent from this set has no write path from the profile at all, which is
 * why `sys:level` is not here (a grade follows the position and changes with it).
 */
const FIELDS_WITH_AN_EDITOR = new Set([
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
/**
 * The shared sentinel. Radix `Select` cannot hold an empty string, so every module invented its own
 * — `ROOT_VALUE`, `"__none__"`, `"None"` — and its own label with it.
 */
const NONE = NONE_VALUE;

/** The `yyyy-MM-dd` the date field speaks — a transport shape, not something anyone reads. */
const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : null);

/** The same date as a person reads it. One formatter, no locale here — see `lib/date.ts`. */
const formatDate = (iso?: string | null) => (iso ? formatDisplayDate(iso) : null);

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
  hireDate: toDateInput(user.hireDate) ?? "",
  probationEnd: toDateInput(user.probationEnd) ?? "",
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
  /** The block's name, shown in the card header the pencil sits in. */
  title: string;
};

/**
 * One section of built-in fields, rendered from the server catalogue rather than a hand-written
 * list — adding a field to `FieldRegistry` makes it appear here without touching this file.
 *
 * Editability is per field and comes from `user.fieldAccess`, the same map custom attributes read.
 * It used to be one module-level flag for the whole section, which meant anyone who could edit a
 * person could edit every field about them.
 */
export const SystemFieldGroup: React.FC<Props> = ({ user, fields, title }) => {
  const { mutate } = useSWRConfig();

  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftOf(user));

  const visible = fields.filter((f) => !PROFILE_HIDDEN_SYSTEM_FIELDS.has(f.id));
  /** Editable here = this form has an editor for it *and* the server says the caller may write it. */
  const canEditField = (fieldId: string) =>
    FIELDS_WITH_AN_EDITOR.has(fieldId) && user.fieldAccess?.[fieldId] === "EDIT";
  const editableHere = visible.filter((f) => canEditField(f.id));
  const canEditSection = editableHere.length > 0;

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
      // Changed *and* writable. The server refuses a request carrying a field the caller may not
      // write — whole, not partly — so sending one is not a rejected field, it is a rejected save.
      const changed = <T,>(fieldId: string, isDirty: boolean, value: T): T | undefined =>
        canEditField(fieldId) && isDirty ? value : undefined;

      const res = await updateUserAction({
        userId: user.id,
        firstName: changed("sys:first_name", draft.firstName !== initial.firstName, draft.firstName),
        lastName: changed("sys:last_name", draft.lastName !== initial.lastName, draft.lastName),
        email: changed("sys:email", draft.email !== initial.email, draft.email),
        hireDate: changed("sys:hire_date", draft.hireDate !== initial.hireDate, draft.hireDate),
        probationEnd: changed(
          "sys:probation_end",
          draft.probationEnd !== initial.probationEnd,
          draft.probationEnd
        ),
        managerId: changed(
          "sys:manager",
          (draft.manager?.id ?? null) !== (initial.manager?.id ?? null),
          draft.manager?.id ?? null
        ),
        jobId: changed("sys:job", draft.jobId !== initial.jobId, idOrNull(draft.jobId)),
        officeId: changed("sys:office", draft.officeId !== initial.officeId, idOrNull(draft.officeId)),
        legalEntityId: changed(
          "sys:legal_entity",
          draft.legalEntityId !== initial.legalEntityId,
          idOrNull(draft.legalEntityId)
        ),
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
          <DatePicker
            value={draft.hireDate}
            ariaLabel="Hire date"
            onChange={(value) => setDraft((d) => ({ ...d, hireDate: value }))}
          />
        );
      case "sys:probation_end":
        return (
          <DatePicker
            value={draft.probationEnd}
            ariaLabel="Probation end"
            onChange={(value) => setDraft((d) => ({ ...d, probationEnd: value }))}
          />
        );
      case "sys:manager":
        return (
          <UserPickerField
            value={draft.manager}
            onChange={(manager) => setDraft((d) => ({ ...d, manager }))}
          />
        );
      case "sys:job":
        return (
          <ReferenceSelect
            source="jobs"
            value={draft.jobId}
            onChange={(jobId) => setDraft((d) => ({ ...d, jobId }))}
          />
        );
      case "sys:office":
        return (
          <ReferenceSelect
            source="offices"
            value={draft.officeId}
            onChange={(officeId) => setDraft((d) => ({ ...d, officeId }))}
          />
        );
      case "sys:legal_entity":
        return (
          <ReferenceSelect
            source="legalEntities"
            value={draft.legalEntityId}
            onChange={(legalEntityId) => setDraft((d) => ({ ...d, legalEntityId }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProfileSectionCard
      title={title}
      actions={
        canEditSection ? (
          isEdit ? (
            <>
              {saveError && <span className="text-sm text-destructive">{saveError}</span>}
              <Button variant="outline" size="sm" onClick={cancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={!dirty || isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <SectionEditButton
              label={`Edit ${title}`}
              onClick={() => {
                setDraft(draftOf(user));
                setSaveError(null);
                setIsEdit(true);
              }}
            />
          )
        ) : null
      }
    >
      <div className="divide-y divide-brown-100">
        {visible.map((field) => {
          const editing = isEdit && canEditField(field.id);

          return (
            <div
              key={field.id}
              className="grid grid-cols-[minmax(14rem,18rem)_1fr] items-center gap-5 py-3.5"
            >
              <div className="text-sm text-muted-foreground">{field.label}</div>
              <div className="text-sm text-foreground">
                {editing ? editorFor(field.id) : <SystemFieldValue user={user} field={field} />}
              </div>
            </div>
          );
        })}
      </div>
    </ProfileSectionCard>
  );
};

/** Picker for a single-valued reference, backed by the shared catalogue hook. */
const ReferenceSelect: React.FC<{
  source: ReferenceValueSource;
  value: string;
  onChange: (value: string) => void;
}> = ({ source, value, onChange }) => {
  const { options, isLoading } = useReferenceOptions(source);

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading…" : "Select"}/>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={NONE}>{NONE_LABEL}</SelectItem>
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
        user={isOpen ? { ...user, roles: user.roles ?? [] } : null}
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
    // Not in FIELDS_WITH_AN_EDITOR on purpose: the grade follows the position, so it changes by
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
          values={user.calendars?.map((c) => ({ id: c.id, name: c.name }))}
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
