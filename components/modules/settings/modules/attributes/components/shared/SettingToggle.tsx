"use client";

import React from "react";
import { Switch } from "@/components/desact/switch";

/**
 * One on/off setting inside the attribute modals: label + optional hint on the left, switch on the
 * right. Extracted because the same row was written three times (config fields, edit modal, create
 * form) and drifted — one of them was a bare checkbox.
 */
export function SettingToggle({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-body font-medium text-primary">{label}</p>
        {hint && <p className="text-hint text-tertiary">{hint}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
