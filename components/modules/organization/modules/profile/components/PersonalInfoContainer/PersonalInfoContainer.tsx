"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { AttributeType, bareOptionId, hasDefaultValueSupport, optionValueId } from "@/models/attribute";
import { PersonalInfoSidebar } from "./components/PersonalInfoSidebar";
import { PersonalInfoAttributesList } from "./components/PersonalInfoAttributesList";
import {
  SystemFieldGroup,
  PROFILE_HIDDEN_SYSTEM_FIELDS,
  canEditSystemField,
  changedSystemFields,
  systemDraftOf,
  systemPatchOf,
  type SystemDraft,
} from "./components/SystemFieldGroup";
import { ProfileSaveBar } from "./components/ProfileSaveBar";
import { User } from "@/models/user/User";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { useActiveSectionScroll } from "@/components/modules/organization/modules/profile/hooks/useActiveSectionScroll";
import { useProfileEditGuard } from "@/components/modules/organization/modules/profile/context/ProfileEditGuard";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import { SectionEditButton } from "./components/ProfileSectionCard";
import { useSWRConfig } from "swr";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAction } from "@/components/modules/organization/modules/profile/actions/updateUserAction";
import { PositionHistoryPanel } from "@/components/modules/organization/modules/profile/components/PositionHistoryPanel";

/** The position timeline's place in the page and the sidebar. */
const POSITION_HISTORY_SECTION_ID = "position-history";
/** The system group the timeline follows — it is the history of a field in that group. */
const POSITION_HISTORY_AFTER_GROUP = "Organization";

type PersonalInfoContainerProps = { user?: User };

/** Built-in groups' section ids start with this; custom groups are keyed by their own id. */
const SYSTEM_GROUP_PREFIX = "sys-group:";

/**
 * Has this value changed?
 *
 * Multi-value fields are **sets, not sequences** — the order the options were ticked in is not part
 * of the value. Comparing element by element reported a change where there was none, so reordering
 * a multi-select armed Save and re-submitted an identical selection.
 */
/**
 * The form works in option **ids**, which is what the API reads and writes.
 *
 * This used to be a bridge — try the id, then the option's text, then give up — because a value was
 * read as its text and written as its id. It is an unwrap now, and there is nothing left to guess:
 * `{ id, label }` in, the id out.
 */
const toOptionId = (raw: unknown): unknown => {
  if (raw == null) return raw;
  const id = optionValueId(raw) ?? raw;
  // The editors list the options of `/groups`, which spell an id without `opt:`.
  return typeof id === "string" ? bareOptionId(id) : id;
};

const sameValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) || Array.isArray(b)) {
    const norm = (v: unknown) =>
      (Array.isArray(v) ? v : [v]).map((x) => JSON.stringify(x)).sort();
    const aa = norm(a);
    const bb = norm(b);
    return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
  }
  return JSON.stringify(a) === JSON.stringify(b);
};

export const PersonalInfoContainer: React.FC<PersonalInfoContainerProps> = ({ user }) => {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const { data: fetchedGroups, isLoading, error } = useAttributeGroups();
  const { data: catalogue, isLoading: isCatalogueLoading } = useUserFields();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  /**
   * The blocks open for editing — system and custom alike, by section id.
   *
   * Opening is still per block, by the block's own pencil: one page-wide Edit armed every field at
   * once, which the owner rejected on the walk. What is no longer per block is the draft and Save
   * (person-profile plan 9.3): every open block edits one draft, and the sticky bar saves all of it
   * in one `PATCH`. So opening a second block cannot lose the first one's changes, and the other
   * pencils no longer withdraw.
   */
  const [openGroupIds, setOpenGroupIds] = useState<ReadonlySet<string>>(() => new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});
  /** The built-in fields' draft; null while no system block is open. */
  const [systemDraft, setSystemDraft] = useState<SystemDraft | null>(null);
  /**
   * The person's version when the first block opened. It goes with the save, so a colleague's save
   * in between is refused (E00409) rather than overwritten.
   */
  const [openedAtVersion, setOpenedAtVersion] = useState<number | undefined>(undefined);

  const { mutate } = useSWRConfig();
  const { setDirty: setGuardDirty } = useProfileEditGuard();

  useEffect(() => {
    if (!fetchedGroups) return;
    const normalized = sortBySortOrder(fetchedGroups);
    setGroups(normalized);
  }, [fetchedGroups]);

  const valueMap = useMemo<Record<string, unknown>>(() => {
    const src: Record<string, unknown> = user?.custom ?? {};
    const out: Record<string, unknown> = {};
    for (const k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      if (k.startsWith("attr:")) out[k.slice(5)] = src[k];
    }

    // An option arrives as `{ id, label }` and the form works in ids, so the pair is unwrapped here,
    // once, at the boundary: the select editor can match its items, the dirty check compares like
    // with like, and Save sends what the API takes. Doing it per consumer is what left a
    // single-select showing an empty control for a field that had a value.
    for (const group of groups) {
      for (const attribute of group.attributes) {
        if (!(attribute.id in out)) continue;
        const raw = out[attribute.id];
        if (attribute.type === AttributeType.SELECT) {
          out[attribute.id] = toOptionId(raw);
        } else if (attribute.type === AttributeType.MULTI_SELECT) {
          const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
          out[attribute.id] = list.map((v) => toOptionId(v));
        }
      }
    }
    return out;
  }, [user?.custom, groups]);

  // New values from the server replace the custom draft — as they always did — and close the custom
  // blocks, whose editors would otherwise show a draft of values that are gone.
  useEffect(() => {
    setInitialValues(valueMap);
    setDraftValues(valueMap);
    setOpenGroupIds((open) => {
      const kept = [...open].filter((id) => id.startsWith(SYSTEM_GROUP_PREFIX));
      return kept.length === open.size ? open : new Set(kept);
    });
  }, [valueMap]);

  const visibleGroups = useMemo(() => {
    const fa = user?.fieldAccess ?? {};
    return groups
      .map((g) => ({
        ...g,
        attributes: g.attributes.filter((a) => fa[`attr:${a.id}`]),
      }))
      .filter((g) => g.attributes.length > 0);
  }, [groups, user?.fieldAccess]);

  // Sensitive fields without VIEW: the server sends them with a masked value and access "MASKED",
  // so they stay listed but are neither readable nor editable.
  const maskedAttrIds = useMemo(() => {
    const fa = user?.fieldAccess ?? {};
    const ids = new Set<string>();
    for (const g of groups) {
      for (const a of g.attributes) {
        if (fa[`attr:${a.id}`] === "MASKED") ids.add(a.id);
      }
    }
    return ids;
  }, [groups, user?.fieldAccess]);

  const editableAttrIds = useMemo(() => {
    const fa = user?.fieldAccess ?? {};
    const ids = new Set<string>();
    for (const g of groups) {
      for (const a of g.attributes) {
        if (fa[`attr:${a.id}`] === "EDIT") ids.add(a.id);
      }
    }
    return ids;
  }, [groups, user?.fieldAccess]);

  // Client-side validity per field (reported by rows) — blocks Save while invalid.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const setFieldError = useCallback((attrId: string, err: string | null) => {
    setFieldErrors((prev) => {
      if (err) {
        if (prev[attrId] === err) return prev;
        return { ...prev, [attrId]: err };
      }
      if (!(attrId in prev)) return prev;
      const { [attrId]: _omit, ...rest } = prev;
      return rest;
    });
  }, []);
  const hasErrors = Object.keys(fieldErrors).length > 0;

  // Prefill empty, editable, default-capable fields with their configured default on edit.
  // The capable set comes from the same helper the attribute editor uses, so a type that offers a
  // default in settings always applies it here (PHONE used to be offered but never applied).
  const applyDefaults = (
    base: Record<string, unknown>,
    group: AttributeGroup
  ): Record<string, unknown> => {
    const next = { ...base };
    for (const a of group.attributes) {
      if (!editableAttrIds.has(a.id) || !hasDefaultValueSupport(a.type)) continue;
      const dv = a.defaultValue;
      if (dv == null || dv === "") continue;
      const cur = next[a.id];
      if (cur === undefined || cur === null || cur === "") next[a.id] = dv;
    }
    return next;
  };

  // System groups come from the field registry, in the order it declares; custom groups follow.
  // Nothing about them is hardcoded here, so registering a field on the backend shows it up here.
  const systemGroups = useMemo(() => {
    // Which system fields this caller may see *on this person* — resolved per target by the server
    // and delivered in `fieldAccess`, the same map custom attributes use.
    const access = user?.fieldAccess ?? {};

    const systemFields = (catalogue ?? [])
      .filter((f) => f.isSystem && !PROFILE_HIDDEN_SYSTEM_FIELDS.has(f.id))
      .filter((f) => Boolean(access[f.id]));

    const byGroup = new Map<string, typeof systemFields>();
    for (const field of systemFields) {
      const key = field.group ?? "Other";
      byGroup.set(key, [...(byGroup.get(key) ?? []), field]);
    }

    return [...byGroup.entries()].map(([name, fields]) => ({
      id: `${SYSTEM_GROUP_PREFIX}${name}`,
      name,
      fields,
    }));
  }, [catalogue, user?.fieldAccess]);

  // The panel draws nothing for a reader who may not see the position, so it takes no place in the
  // sidebar either.
  const showPositionHistory = Boolean(user?.fieldAccess?.["sys:job"]);

  /**
   * The built-in groups, with the position timeline after Organization (or after the last built-in
   * group, when Organization is not visible to this reader).
   */
  const leadingIds = useMemo(() => {
    const ids: { id: string; name: string }[] = systemGroups.map((g) => ({ id: g.id, name: g.name }));
    if (!showPositionHistory) return ids;
    const after = ids.findIndex((g) => g.name === POSITION_HISTORY_AFTER_GROUP);
    ids.splice(after === -1 ? ids.length : after + 1, 0, {
      id: POSITION_HISTORY_SECTION_ID,
      name: "Position History",
    });
    return ids;
  }, [systemGroups, showPositionHistory]);

  const sections = useMemo(
    () => [...leadingIds, ...visibleGroups.map((g) => ({ id: g.id, name: g.name }))],
    [leadingIds, visibleGroups]
  );

  const sectionIds = sections.map((s) => s.id);
  const { activeId, registerSection, scrollToId } = useActiveSectionScroll({
    containerRef: scrollContainerRef,
    sectionIds,
  });

  /** Custom attributes whose draft differs from what was loaded — and that the caller may write. */
  const changedAttrIds = useMemo(
    () =>
      new Set(
        [...editableAttrIds].filter((k) => !sameValue(initialValues[k], draftValues[k]))
      ),
    [editableAttrIds, initialValues, draftValues]
  );

  const changedSysFieldIds = useMemo(
    () => (user ? new Set(changedSystemFields(user, systemDraft)) : new Set<string>()),
    [user, systemDraft]
  );

  const changeCount = changedAttrIds.size + changedSysFieldIds.size;

  // Two ways to lose a draft: leaving the app (beforeunload) and switching profile tabs, which the
  // App Router cannot block — hence the shared guard the tab bar reads.
  const hasUnsavedDraft = changeCount > 0;

  useEffect(() => {
    setGuardDirty(hasUnsavedDraft);
    return () => setGuardDirty(false);
  }, [hasUnsavedDraft, setGuardDirty]);

  useEffect(() => {
    if (!hasUnsavedDraft) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedDraft]);

  /** Opens one block. The first block opened fixes the version the save will be checked against. */
  const openGroup = (groupId: string) => {
    if (openGroupIds.size === 0) {
      setOpenedAtVersion(user?.version);
      setSaveError(null);
    }
    setOpenGroupIds((open) => new Set(open).add(groupId));
  };

  const onEditCustomGroup = (group: AttributeGroup) => {
    // Over the current draft, not the loaded values: another open block's changes must survive.
    setDraftValues((d) => applyDefaults(d, group));
    openGroup(group.id);
  };

  const onEditSystemGroup = (groupId: string) => {
    if (!user) return;
    setSystemDraft((d) => d ?? systemDraftOf(user));
    openGroup(groupId);
  };

  /** Closes one block that holds no changes. A block with changes is closed by Discard or Save. */
  const closeGroup = (groupId: string) => {
    const next = new Set(openGroupIds);
    next.delete(groupId);
    setOpenGroupIds(next);
    if (![...next].some((id) => id.startsWith(SYSTEM_GROUP_PREFIX))) setSystemDraft(null);
    if (next.size === 0) setOpenedAtVersion(undefined);
  };

  const closeAll = () => {
    setOpenGroupIds(new Set());
    setSystemDraft(null);
    setOpenedAtVersion(undefined);
    setFieldErrors({});
  };

  const onDiscard = () => {
    setDraftValues(initialValues);
    setSaveError(null);
    closeAll();
  };

  const onSave = async () => {
    if (!user?.id) return;

    const attributes: Record<string, unknown> = {};
    for (const attrId of changedAttrIds) {
      attributes[attrId] = draftValues[attrId] ?? null;
    }
    const system = systemPatchOf(user, systemDraft);

    if (Object.keys(attributes).length === 0 && Object.keys(system).length === 0) {
      closeAll();
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      // One request for every open block: the server checks each field it carries before writing
      // any, and refuses the whole save if one of them may not be written.
      const res = await updateUserAction({
        userId: user.id,
        version: openedAtVersion,
        ...system,
        ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
      });
      if (res.status === ActionStatus.SUCCESS) {
        setInitialValues(draftValues);
        closeAll();
        await mutate(`/api/users/${user.id}`);
      } else {
        // The draft stays exactly as it was typed, so a refusal can be corrected rather than retyped.
        setSaveError(res.errorMessage ?? "Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * The header of one block: its pencil while closed; Cancel while open and unchanged. An open block
   * with changes has nothing here — Discard and Save are in the bar, so no click in a header can
   * lose a draft.
   */
  const groupActions = (
    groupId: string,
    name: string,
    canEdit: boolean,
    isChanged: boolean,
    onEdit: () => void
  ): React.ReactNode => {
    if (!canEdit) return null;
    if (!openGroupIds.has(groupId)) {
      return <SectionEditButton label={`Edit ${name}`} onClick={onEdit}/>;
    }
    if (isChanged) return null;
    return (
      <Button variant="outline" size="sm" onClick={() => closeGroup(groupId)} disabled={isSaving}>
        Cancel
      </Button>
    );
  };

  // Both queries, not just the groups: the field catalogue produces the system-field sections and
  // half the sidebar, so painting before it lands showed a profile that looked like it had neither.
  // The same defect was fixed in the People table — the flag was fetched and never read.
  if (isLoading || isCatalogueLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader/>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-danger-600">Failed to load</div>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader/>
      </div>
    );
  }

  // Three different silences that used to look identical: nothing configured yet, configured but
  // not visible to this reader, and everything fine.
  const attributesNotice = !groups.length
    ? "No custom fields have been set up for this company yet."
    : !visibleGroups.length
      ? "You don't have access to any of this person's custom fields."
      : null;

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-[260px_1fr] gap-7 bg-background">
        <PersonalInfoSidebar
          sections={sections}
          activeId={activeId || sections[0]?.id}
          onSelect={(id) => scrollToId(id)}
        />

        <PersonalInfoAttributesList
          ref={scrollContainerRef}
          groups={visibleGroups}
          leadingSections={leadingIds.flatMap(({ id }) => {
            if (id === POSITION_HISTORY_SECTION_ID) {
              return [{ id, content: <PositionHistoryPanel userId={user.id} user={user}/> }];
            }
            const g = systemGroups.find((group) => group.id === id);
            if (!g) return [];
            return [{
              id,
              content: (
                <SystemFieldGroup
                  user={user}
                  fields={g.fields}
                  title={g.name}
                  isEdit={openGroupIds.has(g.id)}
                  draft={systemDraft}
                  onDraftChange={(update) => setSystemDraft((d) => (d ? update(d) : d))}
                  actions={groupActions(
                    g.id,
                    g.name,
                    g.fields.some((f) => canEditSystemField(user, f.id)),
                    g.fields.some((f) => changedSysFieldIds.has(f.id)),
                    () => onEditSystemGroup(g.id)
                  )}
                />
              ),
            }];
          })}
          attributesNotice={attributesNotice}
          valueMap={draftValues}
          initialValueMap={initialValues}
          registerSection={registerSection}
          openGroupIds={openGroupIds}
          editableAttrIds={editableAttrIds}
          maskedAttrIds={maskedAttrIds}
          onChangeValue={(attrId, v) =>
            setDraftValues((d) => ({ ...d, [attrId]: v }))
          }
          onValidityChange={setFieldError}
          renderGroupActions={(groupId) => {
            const group = visibleGroups.find((g) => g.id === groupId);
            if (!group) return null;
            return groupActions(
              group.id,
              group.name,
              group.attributes.some((a) => editableAttrIds.has(a.id)),
              group.attributes.some((a) => changedAttrIds.has(a.id)),
              () => onEditCustomGroup(group)
            );
          }}
          footer={
            <ProfileSaveBar
              changeCount={changeCount}
              isSaving={isSaving}
              saveBlocked={hasErrors}
              error={saveError}
              onDiscard={onDiscard}
              onSave={onSave}
            />
          }
        />
    </div>
  );
};
