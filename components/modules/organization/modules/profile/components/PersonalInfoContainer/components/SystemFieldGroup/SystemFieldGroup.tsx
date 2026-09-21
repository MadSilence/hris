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
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import {
  useAssignUserRolesAction,
} from "@/components/modules/settings/modules/roles/hooks/Role/useAssignUserRolesAction/useAssignUserRolesAction";
import {
  AssignRolesModal,
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesModal";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDisplayDate } from "@/lib/date";
import { NONE_LABEL, NONE_VALUE } from "@/models/select";
import {
  ProfileSectionCard,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/ProfileSectionCard";
import { canEditSystemField, type SystemDraft } from "./systemDraft";

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
 * The shared sentinel. Radix `Select` cannot hold an empty string, so every module invented its own
 * — `ROOT_VALUE`, `"__none__"`, `"None"` — and its own label with it.
 */
const NONE = NONE_VALUE;

/** The same date as a person reads it. One formatter, no locale here — see `lib/date.ts`. */
const formatDate = (iso?: string | null) => (iso ? formatDisplayDate(iso) : null);

type Props = {
  user: User;
  fields: FieldDTO[];
  /** The block's name, shown in the card header the pencil sits in. */
  title: string;
  /** Whether this block is open for editing. */
  isEdit: boolean;
  /**
   * The page's draft of the built-in fields — owned by the container, because one Save at the
   * bottom of the page writes every block at once (person-profile plan 9.3). Null while no system
   * block is open.
   */
  draft: SystemDraft | null;
  onDraftChange: (update: (draft: SystemDraft) => SystemDraft) => void;
  /** The pencil, or Cancel, for this block — the container decides, because it owns the draft. */
  actions?: React.ReactNode;
};

/**
 * One section of built-in fields, rendered from the server catalogue rather than a hand-written
 * list — adding a field to `FieldRegistry` makes it appear here without touching this file.
 *
 * Editability is per field and comes from `user.fieldAccess`, the same map custom attributes read.
 * It used to be one module-level flag for the whole section, which meant anyone who could edit a
 * person could edit every field about them.
 *
 * It no longer saves itself: the block renders its editors over the page's draft, and the sticky
 * save bar sends every block's changes in one `PATCH`.
 */
export const SystemFieldGroup: React.FC<Props> = ({
  user,
  fields,
  title,
  isEdit,
  draft,
  onDraftChange,
  actions,
}) => {
  const visible = fields.filter((f) => !PROFILE_HIDDEN_SYSTEM_FIELDS.has(f.id));
  if (visible.length === 0) return null;

  const set = (patch: Partial<SystemDraft>) => onDraftChange((d) => ({ ...d, ...patch }));

  const editorFor = (fieldId: string, d: SystemDraft): React.ReactNode => {
    switch (fieldId) {
      case "sys:first_name":
        return (
          <Input
            aria-label="First name"
            value={d.firstName}
            // Read the value now: React nulls `currentTarget` once the handler returns, and the
            // functional setState body executes after that.
            onChange={(e) => set({ firstName: e.target.value })}
          />
        );
      case "sys:last_name":
        return (
          <Input
            aria-label="Last name"
            value={d.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
          />
        );
      case "sys:email":
        return (
          <Input
            type="email"
            aria-label="Email"
            value={d.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        );
      case "sys:hire_date":
        return (
          <DatePicker
            value={d.hireDate}
            ariaLabel="Hire date"
            onChange={(value) => set({ hireDate: value })}
          />
        );
      case "sys:probation_end":
        return (
          <DatePicker
            value={d.probationEnd}
            ariaLabel="Probation end"
            onChange={(value) => set({ probationEnd: value })}
          />
        );
      case "sys:manager":
        return (
          <UserPickerField
            value={d.manager}
            onChange={(manager) => set({ manager })}
          />
        );
      case "sys:job":
        return (
          <ReferenceSelect
            source="jobs"
            value={d.jobId}
            onChange={(jobId) => set({ jobId })}
          />
        );
      case "sys:office":
        return (
          <ReferenceSelect
            source="offices"
            value={d.officeId}
            onChange={(officeId) => set({ officeId })}
          />
        );
      case "sys:legal_entity":
        return (
          <ReferenceSelect
            source="legalEntities"
            value={d.legalEntityId}
            onChange={(legalEntityId) => set({ legalEntityId })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProfileSectionCard title={title} actions={actions}>
      <div className="divide-y divide-brown-100">
        {visible.map((field) => {
          const editing = isEdit && draft !== null && canEditSystemField(user, field.id);
          // While the section is being edited, a derived field says where it is changed rather
          // than just sitting there unchangeable.
          const source = isEdit && field.derivedFrom ? fields.find((f) => f.id === field.derivedFrom) : undefined;

          return (
            <div
              key={field.id}
              className="grid grid-cols-[minmax(14rem,18rem)_1fr] items-center gap-5 py-3.5"
            >
              <div className="text-sm text-muted-foreground">{field.label}</div>
              <div className="text-sm text-foreground">
                {editing && draft ? editorFor(field.id, draft) : <SystemFieldValue user={user} field={field} />}
                {source ? (
                  <p className="m-0 mt-1 text-xs text-muted-foreground">
                    Follows {source.label}. Change the {source.label.toLowerCase()} to change it.
                  </p>
                ) : null}
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
        <UserChip id={user.manager.id} name={user.manager.name} />
      ) : (
        <NotSet />
      );
    default:
      // A field registered on the backend that nothing here knows how to read yet.
      return isReferenceField(field) ? <NotSet /> : <NotSet />;
  }
};
