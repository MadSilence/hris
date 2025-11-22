"use client";

import React from "react";
import { ALL_ATTRIBUTE_TYPES, AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { Option } from "@/components/ui/Select";
import Select from "@/components/ui/Select/Select";

type TypeSelectProps = {
  value: AttributeType;
  onChange: (type: AttributeType) => void;
};

const options: Option[] = ALL_ATTRIBUTE_TYPES.map((type) => ({
  value: type,
  label: getAttributeTypeLabel(type),
}));

export const TypeSelect: React.FC<TypeSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select
      label="Type"
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Choose type"
    />
  );
};
