import * as React from "react";
import { forwardRef } from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import styles from "./PersonalInfoAttributesLists.module.css";
import {
  PersonalInfoAttributesRow
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow";

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
      <section ref={ref} className={styles.content}>
        {groups.map((group, idx) => (
          <div
            key={group.id}
            ref={(el) => registerSection(group.id, el)}
            data-group-id={group.id}
            className={styles.groupSection}
          >
            <div className={styles.groupTitle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className={styles.titleReset}>{group.name}</h2>
              {idx === 0 && headerActions}
            </div>

            <div className={styles.card}>
              {group.attributes.length ? (
                <div>
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
                <div className={styles.emptyGroup}>No attributes</div>
              )}
            </div>
          </div>
        ))}
      </section>
    );
  }
);
