import * as React from "react";
import { forwardRef } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { PersonalInfoAttributesRow } from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow";

type Props = {
  groups: AttributeGroup[];
  valueMap: Record<string, unknown>;
  registerSection: (id: string, el: HTMLElement | null) => void;
  isEdit: boolean;
  editableAttrIds: Set<string>;
  /** Attributes the caller may only see masked (sensitive + no VIEW) — rendered as a placeholder. */
  maskedAttrIds?: Set<string>;
  onChangeValue: (attributeId: string, v: unknown) => void;
  onValidityChange?: (attributeId: string, error: string | null) => void;
  headerActions?: React.ReactNode;
  /** Rendered above the attribute groups and tracked by the scrollspy under `leadingSectionId`. */
  /** Built-in sections rendered above the custom groups, tracked by the same scrollspy. */
  leadingSections?: { id: string; title: string; content: React.ReactNode }[];
  /** Why there are no attribute groups — "not configured" reads differently from "no access". */
  attributesNotice?: string | null;
};

export const PersonalInfoAttributesList = forwardRef<HTMLDivElement, Props>(
  (
    {
      groups,
      valueMap,
      registerSection,
      isEdit,
      editableAttrIds,
      maskedAttrIds,
      onChangeValue,
      onValidityChange,
      headerActions,
      leadingSections,
      attributesNotice,
    },
    ref
  ) => {
    return (
      <section ref={ref} className="relative h-full min-h-0 overflow-y-auto pr-1">
        {/*
          The actions used to be rendered inside the first group, which put Save out of reach as
          soon as you scrolled. They belong to the whole form, so they stay pinned to the top.
        */}
        {headerActions && (
          <div className="sticky top-0 z-10 -mt-1 flex justify-end bg-background py-2">
            {headerActions}
          </div>
        )}

        {leadingSections?.map((section) => (
          <div
            key={section.id}
            ref={(el) => registerSection(section.id, el)}
            data-group-id={section.id}
            className="mb-8"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            </div>

            {section.content}
          </div>
        ))}

        {attributesNotice && (
          <div className="mb-8 rounded-lg border border-dashed border-brown-200 px-4 py-6 text-sm text-muted-foreground">
            {attributesNotice}
          </div>
        )}

        {groups.map((group) => (
          <div
            key={group.id}
            ref={(el) => registerSection(group.id, el)}
            data-group-id={group.id}
            className="mb-8"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
            </div>

            {group.attributes.length ? (
              <div className="divide-y divide-brown-200 border-t border-brown-200">
                {group.attributes
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((attr) => (
                    <PersonalInfoAttributesRow
                      key={attr.id}
                      attribute={attr}
                      rawValue={valueMap[attr.id]}
                      masked={maskedAttrIds?.has(attr.id)}
                      isEdit={isEdit && editableAttrIds.has(attr.id)}
                      onChange={(v) => onChangeValue(attr.id, v)}
                      onValidityChange={(err) => onValidityChange?.(attr.id, err)}
                    />
                  ))}
              </div>
            ) : (
              <div className="border-t border-brown-200 py-4 text-sm text-muted-foreground">
                No attributes
              </div>
            )}
          </div>
        ))}
      </section>
    );
  }
);

PersonalInfoAttributesList.displayName = "PersonalInfoAttributesList";
