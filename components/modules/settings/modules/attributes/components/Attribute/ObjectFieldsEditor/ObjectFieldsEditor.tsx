"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Button } from "@/components/desact/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { AttributeType } from "@/models/attribute";
import { attributeTypeLabelKey } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import {
  ObjectFieldDef,
  ObjectSubfieldType,
  OBJECT_SUBFIELD_TYPES,
  keyFromLabel,
} from "@/models/attribute/objectFields";

type Props = {
  fields: ObjectFieldDef[];
  onChange: (fields: ObjectFieldDef[]) => void;
  disabled?: boolean;
};

/** Editor for the sub-schema of a repeatable-object attribute (its sub-fields). */
export const ObjectFieldsEditor: FC<Props> = ({ fields, onChange, disabled }) => {
  const t = useTranslations("settings.attributes.subFields");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");
  const patch = (index: number, next: Partial<ObjectFieldDef>) =>
    onChange(fields.map((f, i) => (i === index ? { ...f, ...next } : f)));

  const addField = () => {
    const label = `Field ${fields.length + 1}`;
    onChange([
      ...fields,
      {
        key: keyFromLabel(label, fields.map((f) => f.key)),
        label,
        type: AttributeType.TEXT,
        sortOrder: fields.length,
      },
    ]);
  };

  const removeField = (index: number) => onChange(fields.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>{t("title")}</Label>
      <p className="text-hint text-tertiary">
        {t("hint")}
      </p>

      {fields.length === 0 && (
        <p className="rounded-card border border-dashed border-divider px-4 py-6 text-center text-body text-tertiary">
          {t("empty")}
        </p>
      )}

      {fields.length > 0 && (
        <div className="space-y-2">
          {/* Column headers once, not above every row — repeating them made each row a different
              height than its neighbours and forced a margin hack on the delete button. */}
          <div className="flex items-center gap-2 px-1 text-hint text-tertiary">
            <span className="flex-1">{t("label")}</span>
            <span className="w-36">{tCommon("fields.type")}</span>
            <span className="w-9" aria-hidden />
          </div>

          <div className="-mx-1 max-h-56 space-y-2 overflow-y-auto px-1 py-1">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={field.label}
                  disabled={disabled}
                  aria-label={t("labelAria", { number: index + 1 })}
                  onChange={(e) => patch(index, { label: e.currentTarget.value })}
                />

                <div className="w-36">
                  <Select
                    value={field.type}
                    disabled={disabled}
                    onValueChange={(v) => patch(index, { type: v as ObjectSubfieldType })}
                  >
                    <SelectTrigger aria-label={t("typeAria", { number: index + 1 })}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECT_SUBFIELD_TYPES.map((subType) => (
                        <SelectItem key={subType} value={subType}>
                          {tSettings(attributeTypeLabelKey(subType))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon" className="shrink-0 text-tertiary hover:text-danger-text"
                  onClick={() => removeField(index)}
                  disabled={disabled}
                  aria-label={t("removeAria", { number: index + 1 })}
                >
                  <Icon icon={Delete02Icon} size="sm" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        className="flex w-full items-center gap-1.5 rounded-control border border-dashed border-field px-3 py-2 text-body text-secondary hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon icon={Add01Icon} size="sm" />
        {t("add")}
      </button>
    </div>
  );
};
