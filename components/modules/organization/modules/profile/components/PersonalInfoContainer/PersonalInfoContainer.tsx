"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { PersonalInfoSidebar } from "./components/PersonalInfoSidebar";
import { PersonalInfoAttributesList } from "./components/PersonalInfoAttributesList";
import { User } from "@/models/user/User";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { useActiveSectionScroll } from "@/components/modules/organization/modules/profile/hooks/useActiveSectionScroll";
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});

  const { mutate } = useSWRConfig();

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

  const sectionIds = visibleGroups.map((g) => g.id);
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

  const onEditToggle = () => {
    setSaveError(null);
    setIsEdit(true);
  };
  const onCancel = () => {
    setDraftValues(initialValues);
    setSaveError(null);
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

  if (error || !groups.length || !visibleGroups.length) {
    const message = error
      ? "Failed to load"
      : !groups.length
        ? "No groups"
        : "No attributes you can view";
    return (
      <Card className="p-6">
        <div className={`text-sm ${error ? "text-red-600" : "text-muted-foreground"}`}>
          {message}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-[260px_1fr] gap-7 bg-background">
        <PersonalInfoSidebar
          groups={visibleGroups}
          activeId={activeId || visibleGroups[0]?.id}
          onSelect={(id) => scrollToId(id)}
        />

        <PersonalInfoAttributesList
          ref={scrollContainerRef}
          groups={visibleGroups}
          valueMap={isEdit ? draftValues : initialValues}
          registerSection={registerSection}
          isEdit={isEdit}
          editableAttrIds={editableAttrIds}
          onChangeValue={(attrId, v) =>
            setDraftValues((d) => ({ ...d, [attrId]: v }))
          }
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
                <Button onClick={onSave} disabled={!dirty || isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            )
          }
        />
    </div>
  );
};
