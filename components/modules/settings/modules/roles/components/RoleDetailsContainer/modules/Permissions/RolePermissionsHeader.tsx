"use client";

import * as React from "react";
import { Button } from "@/public/desact/src/components/ui/button";

export function RolePermissionsHeader({
  onSave,
  onReset,
  disabled,
  saving,
}: {
  onSave: () => void;
  onReset?: () => void;
  disabled: boolean;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {onReset && (
        <Button variant="outline" disabled={saving} onClick={onReset}>
          Reset
        </Button>
      )}
      <Button disabled={disabled || saving} onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
}
