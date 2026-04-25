import * as React from "react";
import { forwardRef } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { PersonalInfoAttributesRow } from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow";
import { Card } from "@/public/desact/src/components/ui/card";

type Props = {
  groups: AttributeGroup[];
  valueMap: Record<string, unknown>;
  registerSection: (id: string, el: HTMLElement | null) => void;

  isEdit: boolean;
  onChangeValue: (attributeId: string, v: unknown) => void;
  /** Рендер кнопок Edit/Cancel/Save в правом углу заголовка ПЕРВОЙ группы */
  headerActions?: React.ReactNode;
};

export const PersonalInfoAttributesList = forwardRef<HTMLDivElement, Props>(
  ({ groups, valueMap, registerSection, isEdit, onChangeValue, headerActions }, ref) => {
    return (
      <section ref={ref} className="min-h-0">
        {groups.map((group, idx) => (
          <div
            key={group.id}
            ref={(el) => registerSection(group.id, el)}
            data-group-id={group.id}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base">{group.name}</h2>
              {idx === 0 && headerActions}
            </div>

            <Card className="p-0">
              {group.attributes.length ? (
                <div className="divide-y">
                  {group.attributes
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((attr) => (
                      <PersonalInfoAttributesRow
                        key={attr.id}
                        attribute={attr}
                        rawValue={valueMap[attr.id]}
                        isEdit={isEdit}
                        onChange={(v) => onChangeValue(attr.id, v)}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4">No attributes</div>
              )}
            </Card>
          </div>
        ))}
      </section>
    );
  }
);
