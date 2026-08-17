"use client";

import { FC } from "react";
import {
  AlignLeft,
  Banknote,
  Boxes,
  Calendar,
  Clock,
  Coins,
  Globe,
  Hash,
  Languages,
  Link,
  Link2,
  List,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  SquareCheck,
  Type,
  User,
} from "lucide-react";

import { Badge } from "@/public/desact/src/components/ui/badge";
import { AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils/attributeTypeUtils";

const TYPE_ICONS: Record<AttributeType, FC<{ className?: string }>> = {
  [AttributeType.TEXT]: Type,
  [AttributeType.LONG_TEXT]: AlignLeft,
  [AttributeType.SELECT]: List,
  [AttributeType.PERSON]: User,
  [AttributeType.CHECKBOX]: SquareCheck,
  [AttributeType.NUMBER]: Hash,
  [AttributeType.MULTI_SELECT]: ListChecks,
  [AttributeType.DATE]: Calendar,
  [AttributeType.EMAIL]: Mail,
  [AttributeType.URL]: Link,
  [AttributeType.PHONE]: Phone,
  [AttributeType.COUNTRY]: Globe,
  [AttributeType.LANGUAGE]: Languages,
  [AttributeType.TIMEZONE]: Clock,
  [AttributeType.CURRENCY]: Banknote,
  [AttributeType.OBJECT]: Boxes,
  [AttributeType.ADDRESS]: MapPin,
  [AttributeType.MONEY]: Coins,
  [AttributeType.REFERENCE]: Link2,
};

/** Attribute type shown as a chip — mirrors the leave-type category chip (icon + soft outline). */
export const AttributeTypeChip: FC<{ type: AttributeType }> = ({ type }) => {
  const Icon = TYPE_ICONS[type] ?? Type;
  return (
    <Badge variant="outline" className="gap-1 border-brown-200 bg-brown-50 font-normal text-brown-600">
      <Icon className="h-3 w-3" />
      {getAttributeTypeLabel(type)}
    </Badge>
  );
};
