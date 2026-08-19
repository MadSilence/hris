"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";

import { PersonChip } from "@/components/ui/PersonChip";
import {
  personDisplayName,
  personInitials,
} from "@/components/modules/settings/modules/departments/utils/personDisplay";
import type { DepartmentPerson } from "@/models/departments";

type Props = {
  person: DepartmentPerson;
  sourceDepartmentId: string | null;
  variant?: "row" | "card";
  height?: number;
  selected?: boolean;
  matched?: boolean;
  badge?: string;
  onClick: () => void;
};

/**
 * The same chip, but grabbable: dragging carries the person and the block they came from. Archived
 * people stay put — the assignment engine would refuse them anyway, and a drag that silently does
 * nothing is worse than one that never starts.
 */
export function DraggablePersonChip({
  person,
  sourceDepartmentId,
  variant = "row",
  height,
  selected,
  matched,
  badge,
  onClick,
}: Props) {
  const archived = person.status !== "ACTIVE";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `person:${sourceDepartmentId ?? "none"}:${person.id}`,
    data: { person, sourceDepartmentId },
    disabled: archived,
  });

  return (
    <PersonChip
      ref={setNodeRef}
      variant={variant}
      name={personDisplayName(person)}
      jobName={person.jobName}
      avatarUrl={person.avatarUrl}
      initials={personInitials(person)}
      selected={selected}
      matched={matched}
      archived={archived}
      badge={badge}
      draggable={!archived}
      onClick={onClick}
      className={["nodrag", isDragging ? "opacity-50" : ""].filter(Boolean).join(" ")}
      style={height ? { height } : undefined}
      {...(archived ? {} : listeners)}
      {...(archived ? {} : attributes)}
    />
  );
}
