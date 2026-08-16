"use client";

import { FC } from "react";
import { Baby, Ban, Palmtree, Stethoscope, Tag } from "lucide-react";

import { Badge } from "@/public/desact/src/components/ui/badge";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";

const CATEGORY_META: Record<
  LeaveTypeCategory,
  { label: string; icon: FC<{ className?: string }> }
> = {
  [LeaveTypeCategory.Vacation]: { label: "Vacation", icon: Palmtree },
  [LeaveTypeCategory.Sick]: { label: "Sick", icon: Stethoscope },
  [LeaveTypeCategory.Parental]: { label: "Parental", icon: Baby },
  [LeaveTypeCategory.Unpaid]: { label: "Unpaid", icon: Ban },
  [LeaveTypeCategory.Other]: { label: "Other", icon: Tag },
};

/** Category shown as a chip — mirrors the chip used in the leave-type modal. */
export const LeaveTypeCategoryChip: FC<{ category?: LeaveTypeCategory | null }> = ({ category }) => {
  if (!category) return <span className="text-muted-foreground">—</span>;
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className="gap-1 border-brown-200 bg-brown-50 text-brown-600">
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
};
