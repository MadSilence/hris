"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ATTRIBUTE_TYPES_CREATABLE, AttributeType } from "@/models/attribute";
import { attributeTypeLabelKey } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/desact/select";

type TypeSelectProps = {
  value: AttributeType;
  onChange: (type: AttributeType) => void;
};

export const TypeSelect: React.FC<TypeSelectProps> = ({ value, onChange }) => {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const options = ATTRIBUTE_TYPES_CREATABLE.map((type) => ({
    value: type,
    label: t(attributeTypeLabelKey(type)),
  }));
  return (
    <label>
      {tCommon("fields.type")}
      <Select value={value} onValueChange={(v) => onChange(v as AttributeType)}>
        <SelectTrigger>
          <SelectValue/>
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
};
