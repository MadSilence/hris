"use client";

import React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PROCESS_STATUS_LABELS, type ProcessStatus } from "@/models/lifecycle";

/**
 * A process's state on the shared chip. Planned and in progress are the neutral state, completed the
 * active one; cancelled reads like archived. A partial failure is the one state that asks for attention.
 */
export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  if (status === "PARTIALLY_FAILED") {
    return (
      <Badge variant="outline" className="border-danger-200 bg-danger-50 text-danger-700">
        {PROCESS_STATUS_LABELS[status]}
      </Badge>
    );
  }
  const shared = status === "COMPLETED" ? "active" : status === "CANCELLED" ? "archived" : "draft";
  return <StatusBadge status={shared} label={PROCESS_STATUS_LABELS[status]} />;
}
