"use client";

import React from "react";
import { ALL_ATTRIBUTE_TYPES, AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

type TypeSelectProps = {
  value: AttributeType;
  onChange: (type: AttributeType) => void;
};

const options = ALL_ATTRIBUTE_TYPES.map((type) => ({
  value: type,
  label: getAttributeTypeLabel(type),
}));

export const TypeSelect: React.FC<TypeSelectProps> = ({ value, onChange }) => {
  return (
    <label>
      Type
      <Select value={value} onValueChange={(v) => onChange(v as AttributeType)}>
        <SelectTrigger>
          <SelectValue placeholder="Choose type"/>
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
