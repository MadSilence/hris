"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { hasDefaultValueSupport } from "@/models/attribute";
import { PersonalInfoSidebar } from "./components/PersonalInfoSidebar";
import { PersonalInfoAttributesList } from "./components/PersonalInfoAttributesList";
import {
  SystemFieldGroup,
  PROFILE_HIDDEN_SYSTEM_FIELDS,
} from "./components/SystemFieldGroup";
import { User } from "@/models/user/User";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useCanAccess } from "@/components/auth/useAccess";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { useActiveSectionScroll } from "@/components/modules/organization/modules/profile/hooks/useActiveSectionScroll";
import { useProfileEditGuard } from "@/components/modules/organization/modules/profile/context/ProfileEditGuard";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import { useSWRConfig } from "swr";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";

type PersonalInfoContainerProps = { user?: User };

export const PersonalInfoContainer: React.FC<PersonalInfoContainerProps> = ({ user }) => {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const { data: fetchedGroups, isLoading, error } = useAttributeGroups();
  const { data: catalogue } = useUserFields();
  const canEditProfile = useCanAccess("PEOPLE.PROFILE", "EDIT");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [isEdit, setIsEdit] = useState(false);
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
    const src: any = user?.custom ?? {};
    const out: Record<string, unknown> = {};
    for (const k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      if (k.startsWith("attr:")) out[k.slice(5)] = src[k];
    }
    return out;
  }, [user?.custom]);

  useEffect(() => {
    setInitialValues(valueMap);
    setDraftValues(valueMap);
    setIsEdit(false);
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

  const hasAnyEditable = editableAttrIds.size > 0;

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
  const applyDefaults = (base: Record<string, unknown>): Record<string, unknown> => {
    const next = { ...base };
    for (const g of groups) {
      for (const a of g.attributes) {
        if (!editableAttrIds.has(a.id) || !hasDefaultValueSupport(a.type)) continue;
        const dv = a.defaultValue;
        if (dv == null || dv === "") continue;
        const cur = next[a.id];
        if (cur === undefined || cur === null || cur === "") next[a.id] = dv;
      }
    }
    return next;
  };

  // System groups come from the field registry, in the order it declares; custom groups follow.
  // Nothing about them is hardcoded here, so registering a field on the backend shows it up here.
  const systemGroups = useMemo(() => {
    const systemFields = (catalogue ?? [])
      .filter((f) => f.isSystem && !PROFILE_HIDDEN_SYSTEM_FIELDS.has(f.id));

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
  }, [catalogue]);

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

  const dirty = useMemo(() => {
    const keys = new Set([...Object.keys(initialValues), ...Object.keys(draftValues)]);
    for (const k of keys) {
      const a = initialValues[k];
      const b = draftValues[k];
      if (Array.isArray(a) || Array.isArray(b)) {
        const aa = Array.isArray(a) ? a : [a];
        const bb = Array.isArray(b) ? b : [b];
        if (aa.length !== bb.length) return true;
        const same = aa.every((v, i) => JSON.stringify(v) === JSON.stringify(bb[i]));
        if (!same) return true;
      } else if (JSON.stringify(a) !== JSON.stringify(b)) {
        return true;
      }
    }
    return false;
  }, [initialValues, draftValues]);

  // Two ways to lose a draft: leaving the app (beforeunload) and switching profile tabs, which the
  // App Router cannot block — hence the shared guard the tab bar reads.
  const hasUnsavedDraft = isEdit && dirty;

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

  const onEditToggle = () => {
    setSaveError(null);
    setFieldErrors({});
    setDraftValues(applyDefaults(initialValues));
    setIsEdit(true);
  };
  const onCancel = () => {
    setDraftValues(initialValues);
    setSaveError(null);
    setFieldErrors({});
    setIsEdit(false);
  };
  const onSave = async () => {
    if (!user?.id) return;

    const values: Record<string, unknown> = {};
    for (const attrId of Object.keys(draftValues)) {
      if (!editableAttrIds.has(attrId)) continue;
      if (JSON.stringify(initialValues[attrId]) !== JSON.stringify(draftValues[attrId])) {
        values[attrId] = draftValues[attrId] ?? null;
      }
    }

    if (Object.keys(values).length === 0) {
      setIsEdit(false);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateUserAttributesAction({ userId: user.id, values });
      if (res.status === ActionStatus.SUCCESS) {
        setInitialValues(draftValues);
        setIsEdit(false);
        await mutate(`/api/users/${user.id}`);
      } else {
        setSaveError(res.errorMessage ?? "Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            title: g.name,
            content: (
              <SystemFieldGroup user={user} fields={g.fields} canEdit={canEditProfile}/>
            ),
          }))}
          attributesNotice={attributesNotice}
          valueMap={isEdit ? draftValues : initialValues}
          registerSection={registerSection}
          isEdit={isEdit}
          editableAttrIds={editableAttrIds}
          maskedAttrIds={maskedAttrIds}
          onChangeValue={(attrId, v) =>
            setDraftValues((d) => ({ ...d, [attrId]: v }))
          }
          onValidityChange={setFieldError}
          headerActions={
            !isEdit ? (
              hasAnyEditable ? (
                <Button variant="outline" onClick={onEditToggle}>
                  Edit
                </Button>
              ) : null
            ) : (
              <div className="flex items-center gap-3">
                {saveError && (
                  <span className="text-sm text-destructive">{saveError}</span>
                )}
                <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={!dirty || isSaving || hasErrors}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            )
          }
        />
    </div>
  );
};
