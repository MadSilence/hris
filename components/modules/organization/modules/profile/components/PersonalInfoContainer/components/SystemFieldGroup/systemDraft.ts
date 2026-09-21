import type { User } from "@/models/user/User";
import type { PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { NONE_VALUE } from "@/models/select";
import type { UpdateUserActionInput } from "@/components/modules/organization/modules/profile/actions/updateUserAction";

/**
 * The built-in fields' half of the profile's one draft.
 *
 * It used to live inside each system block, which saved itself; with one Save for the whole page
 * (person-profile plan 9.3) the draft belongs to the container, and this file is the pure part of
 * it — what the draft starts as, what changed, and what goes on the wire — so it can be tested
 * without rendering a form.
 */

/**
 * System fields this form knows how to edit — a statement about the editors, not about permissions.
 * Whether the caller may write one is `fieldAccess`, resolved by the server per field and per person;
 * a field absent from this set has no write path from the profile at all, which is why `sys:level`
 * is not here (a grade follows the position and changes with it).
 */
export const FIELDS_WITH_AN_EDITOR = new Set([
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

/** Editable here = this form has an editor for it *and* the server says the caller may write it. */
export const canEditSystemField = (user: User, fieldId: string): boolean =>
  FIELDS_WITH_AN_EDITOR.has(fieldId) && user.fieldAccess?.[fieldId] === "EDIT";

export type SystemDraft = {
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

/** The `yyyy-MM-dd` the date field speaks — a transport shape, not something anyone reads. */
const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

export const systemDraftOf = (user: User): SystemDraft => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  email: user.email ?? "",
  hireDate: toDateInput(user.hireDate),
  probationEnd: toDateInput(user.probationEnd),
  manager: user.manager ? { id: user.manager.id, firstName: user.manager.name } : null,
  jobId: user.jobId ?? NONE_VALUE,
  officeId: user.office?.id ?? NONE_VALUE,
  legalEntityId: user.legalEntity?.id ?? NONE_VALUE,
});

/** `NONE` back to the wire value: `null` clears the association. */
const idOrNull = (value: string): string | null => (value === NONE_VALUE ? null : value);

/** Each editable field: how to tell it moved, and what it sends when it did. */
const FIELD_WRITERS: Record<
  string,
  {
    changed: (draft: SystemDraft, initial: SystemDraft) => boolean;
    write: (draft: SystemDraft) => Partial<UpdateUserActionInput>;
  }
> = {
  "sys:first_name": {
    changed: (d, i) => d.firstName !== i.firstName,
    write: (d) => ({ firstName: d.firstName }),
  },
  "sys:last_name": {
    changed: (d, i) => d.lastName !== i.lastName,
    write: (d) => ({ lastName: d.lastName }),
  },
  "sys:email": {
    changed: (d, i) => d.email !== i.email,
    write: (d) => ({ email: d.email }),
  },
  "sys:hire_date": {
    changed: (d, i) => d.hireDate !== i.hireDate,
    write: (d) => ({ hireDate: d.hireDate }),
  },
  "sys:probation_end": {
    changed: (d, i) => d.probationEnd !== i.probationEnd,
    write: (d) => ({ probationEnd: d.probationEnd }),
  },
  "sys:manager": {
    changed: (d, i) => (d.manager?.id ?? null) !== (i.manager?.id ?? null),
    write: (d) => ({ managerId: d.manager?.id ?? null }),
  },
  "sys:job": {
    changed: (d, i) => d.jobId !== i.jobId,
    write: (d) => ({ jobId: idOrNull(d.jobId) }),
  },
  "sys:office": {
    changed: (d, i) => d.officeId !== i.officeId,
    write: (d) => ({ officeId: idOrNull(d.officeId) }),
  },
  "sys:legal_entity": {
    changed: (d, i) => d.legalEntityId !== i.legalEntityId,
    write: (d) => ({ legalEntityId: idOrNull(d.legalEntityId) }),
  },
};

/**
 * The system fields that moved *and* that the caller may write. The second half matters: the server
 * refuses a patch carrying a field the caller may not write — whole, not partly — so sending one is
 * not a rejected field, it is a rejected save.
 */
export const changedSystemFields = (user: User, draft: SystemDraft | null): string[] => {
  if (!draft) return [];
  const initial = systemDraftOf(user);
  return Object.keys(FIELD_WRITERS).filter(
    (fieldId) => canEditSystemField(user, fieldId) && FIELD_WRITERS[fieldId].changed(draft, initial)
  );
};

/**
 * The system half of the patch: only what changed. The version editing started from is the
 * container's to add — it covers the whole page, not only the built-in fields.
 */
export const systemPatchOf = (
  user: User,
  draft: SystemDraft | null
): Partial<UpdateUserActionInput> => {
  if (!draft) return {};
  return changedSystemFields(user, draft).reduce<Partial<UpdateUserActionInput>>(
    (patch, fieldId) => ({ ...patch, ...FIELD_WRITERS[fieldId].write(draft) }),
    {}
  );
};
