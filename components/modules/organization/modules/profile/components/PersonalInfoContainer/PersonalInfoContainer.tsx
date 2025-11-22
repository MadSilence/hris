"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import styles from "./PersonalInfoContainer.module.css";
import { PersonalInfoSidebar } from "./components/PersonalInfoSidebar";
import { PersonalInfoAttributesList } from "./components/PersonalInfoAttributesList";
import { User } from "@/models/user/User";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { useActiveSectionScroll } from "@/components/modules/organization/modules/profile/hooks/useActiveSectionScroll";

type PersonalInfoContainerProps = { user: User };

export const PersonalInfoContainer: React.FC<PersonalInfoContainerProps> = ({ user }) => {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const { data: fetchedGroups, isLoading, error } = useAttributeGroups();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // edit-mode
  const [isEdit, setIsEdit] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!fetchedGroups) return;
    const normalized = sortBySortOrder(fetchedGroups);
    setGroups(normalized);
  }, [fetchedGroups]);

  // valueMap из user.custom: "attr:<id>" -> value
  const valueMap = useMemo<Record<string, unknown>>(() => {
    const src: any = user?.custom ?? {};
    const out: Record<string, unknown> = {};
    for (const k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      if (k.startsWith("attr:")) out[k.slice(5)] = src[k];
    }
    return out;
  }, [user?.custom]);

  // при смене пользователя/данных сбрасываем initial/draft
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
    // простая глубокая проверка по ключам, достаточна для примитивов/массивов
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
    // пока просто логируем payload
    // eslint-disable-next-line no-console
    console.log({ values: draftValues });
    setInitialValues(draftValues);
    setIsEdit(false);
  };

  if (isLoading) return <div style={{ padding: "var(--space-5)" }}>Loading…</div>;
  if (error) return <div style={{ padding: "var(--space-5)", color: "hsl(var(--text-error))" }}>Failed to load</div>;
  if (!groups.length) return <div style={{ padding: "var(--space-5)", color: "hsl(var(--text-disabled))" }}>No groups</div>;

  return (
    <div className={styles.wrap}>
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
        onChangeValue={(attrId, v) => setDraftValues((d) => ({ ...d, [attrId]: v }))}
        headerActions={(
          !isEdit ? (
            <button onClick={onEditToggle} className="btn-edit">Edit</button>
          ) : (
            <div style={{ display: "flex", gap: "var(--space-4)" }}>
              <button onClick={onCancel} className="btn-secondary">Cancel</button>
              <button onClick={onSave} disabled={!dirty} className="btn-primary">Save</button>
            </div>
          )
        )}
      />
    </div>
  );
};
