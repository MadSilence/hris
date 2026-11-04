"use client";

import { FC } from "react";
import { Baby01Icon, BeachIcon, Stethoscope02Icon, Tag01Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";

const CATEGORY_META: Record<
  LeaveTypeCategory,
  { label: string; icon: IconSvgElement }
> = {
  [LeaveTypeCategory.Vacation]: { label: "Vacation", icon: BeachIcon },
  [LeaveTypeCategory.Sick]: { label: "Sick", icon: Stethoscope02Icon },
  [LeaveTypeCategory.Parental]: { label: "Parental", icon: Baby01Icon },
  [LeaveTypeCategory.Unpaid]: { label: "Unpaid", icon: UnavailableIcon },
  [LeaveTypeCategory.Other]: { label: "Other", icon: Tag01Icon },
};

/** Category shown as a chip — mirrors the chip used in the leave-type modal. */
export const LeaveTypeCategoryChip: FC<{ category?: LeaveTypeCategory | null }> = ({ category }) => {
  if (!category) return null;
  const meta = CATEGORY_META[category];
  return (
    <Badge variant="outline" className="gap-1 border-divider bg-subtle text-secondary">
      <Icon icon={meta.icon} size="sm" className="size-3.5" />
      {meta.label}
    </Badge>
  );
};
