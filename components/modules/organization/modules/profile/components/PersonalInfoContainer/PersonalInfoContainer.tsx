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

type PersonalInfoContainerProps = { user?: User };

export const PersonalInfoContainer: React.FC<PersonalInfoContainerProps> = ({ user }) => {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const { data: fetchedGroups, isLoading, error } = useAttributeGroups();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});

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

  const sectionIds = groups.map((g) => g.id);
  const { activeId, registerSection, scrollToId } = useActiveSectionScroll({
    containerRef: scrollContainerRef,
    sectionIds,
    offsetTop: 24,
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

  const onEditToggle = () => setIsEdit(true);
  const onCancel = () => {
    setDraftValues(initialValues);
    setIsEdit(false);
  };
  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log({ values: draftValues });
    setInitialValues(draftValues);
    setIsEdit(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader/>
      </div>
    );
  }

  if (error || !groups.length) {
    return (
      <Card className="p-6">
        <div className={`text-sm ${error ? "text-red-600" : "text-muted-foreground"}`}>
          {error ? "Failed to load" : "No groups"}
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-h-[70vh] bg-background overflow-auto">
      <div className="grid grid-cols-[260px_1fr] gap-7">
        <PersonalInfoSidebar
          groups={groups}
          activeId={activeId || groups[0]?.id}
          onSelect={(id) => scrollToId(id)}
        />

        <PersonalInfoAttributesList
          ref={scrollContainerRef}
          groups={groups}
          valueMap={isEdit ? draftValues : initialValues}
          registerSection={registerSection}
          isEdit={isEdit}
          onChangeValue={(attrId, v) =>
            setDraftValues((d) => ({ ...d, [attrId]: v }))
          }
          headerActions={
            !isEdit ? (
              <Button variant="outline" onClick={onEditToggle}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={!dirty}>
                  Save
                </Button>
              </div>
            )
          }
        />
      </div>
    </div>
  );
};
