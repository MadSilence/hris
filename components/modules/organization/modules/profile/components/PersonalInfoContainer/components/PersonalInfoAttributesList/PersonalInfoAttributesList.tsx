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
  onChangeValue: (attributeId: string, v: unknown) => void;
  headerActions?: React.ReactNode;
};

export const PersonalInfoAttributesList = forwardRef<HTMLDivElement, Props>(
  ({ groups, valueMap, registerSection, isEdit, editableAttrIds, onChangeValue, headerActions }, ref) => {
    return (
      <section ref={ref} className="relative h-full min-h-0 overflow-y-auto pr-1">
        {groups.map((group, idx) => (
          <div
            key={group.id}
            ref={(el) => registerSection(group.id, el)}
            data-group-id={group.id}
            className="mb-8"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
              {idx === 0 && headerActions}
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
                      isEdit={isEdit && editableAttrIds.has(attr.id)}
                      onChange={(v) => onChangeValue(attr.id, v)}
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
