"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { AttributeType, hasDefaultValueSupport } from "@/models/attribute";
import { PersonalInfoSidebar } from "./components/PersonalInfoSidebar";
import { PersonalInfoAttributesList } from "./components/PersonalInfoAttributesList";
import {
  SystemFieldGroup,
  PROFILE_HIDDEN_SYSTEM_FIELDS,
} from "./components/SystemFieldGroup";
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
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";

type PersonalInfoContainerProps = { user?: User };

/**
 * Has this value changed?
 *
 * Multi-value fields are **sets, not sequences** — the order the options were ticked in is not part
 * of the value. Comparing element by element reported a change where there was none, so reordering
 * a multi-select armed Save and re-submitted an identical selection.
 */
/**
 * An option's id, from either shape it can arrive in.
 *
 * Unknown text is returned unchanged rather than dropped: an option deleted after the value was
 * written should show as itself, not vanish into "Not set".
 */
const toOptionId = (attribute: AttributeGroup["attributes"][number], raw: unknown): unknown => {
  if (raw == null) return raw;
  const s = String(raw);
  const byId = attribute.options?.find((o) => o.id === s);
  if (byId) return byId.id;
  const byValue = attribute.options?.find((o) => o.value === s);
  return byValue ? byValue.id : raw;
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
   * The one custom group open for editing, or null. It used to be a single page-wide flag, which
   * armed every field at once and put Save far from what it saved; each block owns its own edit
   * now, the way the system blocks already did.
   */
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});

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

    // Option values arrive as the option's *text* — the read query resolves `option_id` through
    // `ao.value` — while the writer accepts only an option **id**. Normalising here, once, is what
    // lets everything downstream speak one language: the select editor can match its items, the
    // dirty check compares like with like, and Save sends what the API takes. Doing it per consumer
    // is what left a single-select showing an empty control for a field that had a value.
    for (const group of groups) {
      for (const attribute of group.attributes) {
        if (!(attribute.id in out)) continue;
        const raw = out[attribute.id];
        if (attribute.type === AttributeType.SELECT) {
          out[attribute.id] = toOptionId(attribute, raw);
        } else if (attribute.type === AttributeType.MULTI_SELECT) {
          const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
          out[attribute.id] = list.map((v) => toOptionId(attribute, v));
        }
      }
    }
    return out;
  }, [user?.custom, groups]);

  useEffect(() => {
    setInitialValues(valueMap);
    setDraftValues(valueMap);
    setEditingGroupId(null);
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

  const editingGroup = useMemo(
    () => visibleGroups.find((g) => g.id === editingGroupId) ?? null,
    [visibleGroups, editingGroupId]
  );

  /** The attributes the open block holds — what "dirty" and Save are measured over. */
  const editingAttrIds = useMemo(
    () => new Set((editingGroup?.attributes ?? []).map((a) => a.id)),
    [editingGroup]
  );

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
      id: `sys-group:${name}`,
      name,
      fields,
    }));
  }, [catalogue, user?.fieldAccess]);

  const sections = useMemo(
    () => [
      ...systemGroups.map((g) => ({ id: g.id, name: g.name })),
      ...visibleGroups.map((g) => ({ id: g.id, name: g.name })),
    ],
    [systemGroups, visibleGroups]
  );

  const sectionIds = sections.map((s) => s.id);
  const { activeId, registerSection, scrollToId } = useActiveSectionScroll({
    containerRef: scrollContainerRef,
    sectionIds,
  });

  const dirty = useMemo(
    () => [...editingAttrIds].some((k) => !sameValue(initialValues[k], draftValues[k])),
    [editingAttrIds, initialValues, draftValues]
  );

  // Two ways to lose a draft: leaving the app (beforeunload) and switching profile tabs, which the
  // App Router cannot block — hence the shared guard the tab bar reads.
  const hasUnsavedDraft = editingGroupId !== null && dirty;

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

  const onEditGroup = (group: AttributeGroup) => {
    setSaveError(null);
    setFieldErrors({});
    setDraftValues(applyDefaults(initialValues, group));
    setEditingGroupId(group.id);
  };
  const onCancel = () => {
    setDraftValues(initialValues);
    setSaveError(null);
    setFieldErrors({});
    setEditingGroupId(null);
  };
  const onSave = async () => {
    if (!user?.id) return;

    const values: Record<string, unknown> = {};
    for (const attrId of editingAttrIds) {
      if (!editableAttrIds.has(attrId)) continue;
      if (!sameValue(initialValues[attrId], draftValues[attrId])) {
        values[attrId] = draftValues[attrId] ?? null;
      }
    }

    if (Object.keys(values).length === 0) {
      setEditingGroupId(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateUserAttributesAction({ userId: user.id, values });
      if (res.status === ActionStatus.SUCCESS) {
        setInitialValues(draftValues);
        setEditingGroupId(null);
        await mutate(`/api/users/${user.id}`);
      } else {
        setSaveError(res.errorMessage ?? "Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
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
        <div className="text-sm text-red-600">Failed to load</div>
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
          leadingSections={systemGroups.map((g) => ({
            id: g.id,
            content: (
              <SystemFieldGroup user={user} fields={g.fields} title={g.name}/>
            ),
          }))}
          attributesNotice={attributesNotice}
          valueMap={editingGroupId ? draftValues : initialValues}
          initialValueMap={initialValues}
          registerSection={registerSection}
          editingGroupId={editingGroupId}
          editableAttrIds={editableAttrIds}
          maskedAttrIds={maskedAttrIds}
          onChangeValue={(attrId, v) =>
            setDraftValues((d) => ({ ...d, [attrId]: v }))
          }
          onValidityChange={setFieldError}
          renderGroupActions={(groupId) => {
            if (editingGroupId === groupId) {
              return (
                <>
                  {saveError && <span className="text-sm text-destructive">{saveError}</span>}
                  <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={onSave} disabled={!dirty || isSaving || hasErrors}>
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                </>
              );
            }

            // While one block is open its draft is the only one that exists, so the other pencils
            // step aside rather than offering a click that would discard it.
            if (editingGroupId !== null) return null;

            const group = visibleGroups.find((g) => g.id === groupId);
            if (!group || !group.attributes.some((a) => editableAttrIds.has(a.id))) return null;

            return (
              <SectionEditButton label={`Edit ${group.name}`} onClick={() => onEditGroup(group)}/>
            );
          }}
        />
    </div>
  );
};
