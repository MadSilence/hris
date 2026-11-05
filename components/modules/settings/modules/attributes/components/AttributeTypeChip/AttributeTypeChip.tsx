"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Calendar03Icon, CallIcon, CheckListIcon, CheckmarkSquare02Icon, Clock01Icon, Coins01Icon, Globe02Icon, GridTableIcon, LanguageSkillIcon, LeftToRightListBulletIcon, Link01Icon, Location01Icon, Mail01Icon, Money03Icon, PackageIcon, TextAlignLeftIcon, TextFontIcon, UserIcon } from "@hugeicons/core-free-icons";

import { Badge } from "@/components/desact/badge";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { AttributeType } from "@/models/attribute";
import { attributeTypeLabelKey } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils/attributeTypeUtils";

const TYPE_ICONS: Record<AttributeType, IconSvgElement> = {
  [AttributeType.TEXT]: TextFontIcon,
  [AttributeType.LONG_TEXT]: TextAlignLeftIcon,
  [AttributeType.SELECT]: LeftToRightListBulletIcon,
  [AttributeType.PERSON]: UserIcon,
  [AttributeType.CHECKBOX]: CheckmarkSquare02Icon,
  [AttributeType.NUMBER]: GridTableIcon,
  [AttributeType.MULTI_SELECT]: CheckListIcon,
  [AttributeType.DATE]: Calendar03Icon,
  [AttributeType.EMAIL]: Mail01Icon,
  [AttributeType.URL]: Link01Icon,
  [AttributeType.PHONE]: CallIcon,
  [AttributeType.COUNTRY]: Globe02Icon,
  [AttributeType.LANGUAGE]: LanguageSkillIcon,
  [AttributeType.TIMEZONE]: Clock01Icon,
  [AttributeType.CURRENCY]: Money03Icon,
  [AttributeType.OBJECT]: PackageIcon,
  [AttributeType.ADDRESS]: Location01Icon,
  [AttributeType.MONEY]: Coins01Icon,
  [AttributeType.REFERENCE]: Link01Icon,
};

/** Attribute type shown as a chip — mirrors the leave-type category chip (an icon and a word). */
export const AttributeTypeChip: FC<{ type: AttributeType }> = ({ type }) => {
  const t = useTranslations("settings");
  return (
  <Badge variant="neutral">
    <Icon icon={TYPE_ICONS[type] ?? TextFontIcon} size="sm" className="size-3.5" />
    {t(attributeTypeLabelKey(type))}
  </Badge>
  );
};
