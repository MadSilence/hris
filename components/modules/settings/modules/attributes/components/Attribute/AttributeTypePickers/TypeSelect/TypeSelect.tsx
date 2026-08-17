"use client";

import React from "react";
import { ATTRIBUTE_TYPES_CREATABLE, AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

type TypeSelectProps = {
  value: AttributeType;
  onChange: (type: AttributeType) => void;
};

const options = ATTRIBUTE_TYPES_CREATABLE.map((type) => ({
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
