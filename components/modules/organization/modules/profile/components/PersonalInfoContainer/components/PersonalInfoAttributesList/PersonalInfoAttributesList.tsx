import * as React from "react";
import { forwardRef } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import {
  isEmptyValue,
  PersonalInfoAttributesRow,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow";
import {
  ProfileSectionCard,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/ProfileSectionCard";

type Props = {
  groups: AttributeGroup[];
  valueMap: Record<string, unknown>;
  /** The values as they were before this edit — what `required` is measured against. */
  initialValueMap?: Record<string, unknown>;
  registerSection: (id: string, el: HTMLElement | null) => void;
  /** The one group currently open for editing, or null. Editing is per block, not per page. */
  editingGroupId: string | null;
  editableAttrIds: Set<string>;
  /** Attributes the caller may only see masked (sensitive + no VIEW) — rendered as a placeholder. */
  maskedAttrIds?: Set<string>;
  onChangeValue: (attributeId: string, v: unknown) => void;
  onValidityChange?: (attributeId: string, error: string | null) => void;
  /** The pencil, or Cancel/Save, for one custom group — built by the container that owns the draft. */
  renderGroupActions?: (groupId: string) => React.ReactNode;
  /** Built-in sections rendered above the custom groups, tracked by the same scrollspy. */
  leadingSections?: { id: string; content: React.ReactNode }[];
  /** Why there are no attribute groups — "not configured" reads differently from "no access". */
  attributesNotice?: string | null;
};

export const PersonalInfoAttributesList = forwardRef<HTMLDivElement, Props>(
  (
    {
      groups,
      valueMap,
      initialValueMap,
      registerSection,
      editingGroupId,
      editableAttrIds,
      maskedAttrIds,
      onChangeValue,
      onValidityChange,
      renderGroupActions,
      leadingSections,
      attributesNotice,
    },
    ref
  ) => {
    return (
      <section ref={ref} className="relative h-full min-h-0 overflow-y-auto pr-1">
        {/*
          No page-level Save: each block carries its own pencil and its own draft, so the actions
          stay next to what they act on instead of floating above everything.
        */}
        {leadingSections?.map((section) => (
          <div
            key={section.id}
            ref={(el) => registerSection(section.id, el)}
            data-group-id={section.id}
            className="mb-6"
          >
            {section.content}
          </div>
        ))}

        {attributesNotice && (
          <div className="mb-6 rounded-lg border border-dashed border-brown-200 px-4 py-6 text-sm text-muted-foreground">
            {attributesNotice}
          </div>
        )}

        {groups.map((group) => (
          <div
            key={group.id}
            ref={(el) => registerSection(group.id, el)}
            data-group-id={group.id}
            className="mb-6"
          >
            <ProfileSectionCard title={group.name} actions={renderGroupActions?.(group.id)}>
              {group.attributes.length ? (
                <div className="divide-y divide-brown-100">
                  {group.attributes
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((attr) => (
                      <PersonalInfoAttributesRow
                        key={attr.id}
                        attribute={attr}
                        rawValue={valueMap[attr.id]}
                        masked={maskedAttrIds?.has(attr.id)}
                        isEdit={editingGroupId === group.id && editableAttrIds.has(attr.id)}
                        wasFilled={!isEmptyValue((initialValueMap ?? valueMap)[attr.id])}
                        onChange={(v) => onChangeValue(attr.id, v)}
                        onValidityChange={(err) => onValidityChange?.(attr.id, err)}
                      />
                    ))}
                </div>
              ) : (
                <div className="py-4 text-sm text-muted-foreground">No attributes</div>
              )}
            </ProfileSectionCard>
          </div>
        ))}
      </section>
    );
  }
);

PersonalInfoAttributesList.displayName = "PersonalInfoAttributesList";
