"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Baby01Icon, BeachIcon, Stethoscope02Icon, Tag01Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";

/** The catalogue key of each category's label (`timeOff.leaveTypeCategory.*`). */
export const LEAVE_TYPE_CATEGORY_KEYS = {
  [LeaveTypeCategory.Vacation]: "leaveTypeCategory.vacation",
  [LeaveTypeCategory.Sick]: "leaveTypeCategory.sick",
  [LeaveTypeCategory.Parental]: "leaveTypeCategory.parental",
  [LeaveTypeCategory.Unpaid]: "leaveTypeCategory.unpaid",
  [LeaveTypeCategory.Other]: "leaveTypeCategory.other",
} as const satisfies Record<LeaveTypeCategory, string>;

const CATEGORY_ICONS: Record<LeaveTypeCategory, IconSvgElement> = {
  [LeaveTypeCategory.Vacation]: BeachIcon,
  [LeaveTypeCategory.Sick]: Stethoscope02Icon,
  [LeaveTypeCategory.Parental]: Baby01Icon,
  [LeaveTypeCategory.Unpaid]: UnavailableIcon,
  [LeaveTypeCategory.Other]: Tag01Icon,
};

/** Category shown as a chip — mirrors the chip used in the leave-type modal. */
export const LeaveTypeCategoryChip: FC<{ category?: LeaveTypeCategory | null }> = ({ category }) => {
  const t = useTranslations("timeOff");
  if (!category) return null;
  return (
    <Badge variant="outline" className="gap-1 border-divider bg-subtle text-secondary">
      <Icon icon={CATEGORY_ICONS[category]} size="sm" className="size-3.5" />
      {t(LEAVE_TYPE_CATEGORY_KEYS[category])}
    </Badge>
  );
};
