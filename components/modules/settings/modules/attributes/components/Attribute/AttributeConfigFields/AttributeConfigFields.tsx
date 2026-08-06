"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { AttributeType } from "@/models/attribute";

export type AttributeConfig = {
  required?: boolean;
  description?: string | null;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  onlyPositive?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  regex?: string | null;
  minDate?: string | null;
  maxDate?: string | null;
  minSelect?: number | null;
  maxSelect?: number | null;
};

type Props = {
  type: AttributeType;
  value: AttributeConfig;
  onChange: (patch: Partial<AttributeConfig>) => void;
  disabled?: boolean;
};

const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

export const AttributeConfigFields: React.FC<Props> = ({ type, value, onChange, disabled }) => {
  const isNumber = type === AttributeType.NUMBER;
  const isText =
    type === AttributeType.TEXT || type === AttributeType.EMAIL || type === AttributeType.URL;
  const isDate = type === AttributeType.DATE;
  const isMulti = type === AttributeType.MULTI_SELECT;
  const hasDefault = isNumber || isText || isDate;

  const defaultInputType = isNumber ? "number" : isDate ? "date" : "text";

  return (
    <div className="space-y-4 rounded-lg border border-brown-200 p-4">
      <div className="text-sm font-medium text-foreground">Validation &amp; rules</div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!value.required}
          disabled={disabled}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        Required
      </label>

      <div className="space-y-1.5">
        <Label>Description (help text)</Label>
        <Textarea
          value={value.description ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ description: e.currentTarget.value })}
          placeholder="Shown under the field on the profile"
          className="min-h-16"
        />
      </div>

      {hasDefault && (
        <div className="space-y-1.5">
          <Label>Default value</Label>
          <Input
            type={defaultInputType}
            value={value.defaultValue ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ defaultValue: e.currentTarget.value })}
          />
        </div>
      )}

      {isNumber && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Min</Label>
              <Input
                type="number"
                value={value.minValue ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ minValue: num(e.currentTarget.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max</Label>
              <Input
                type="number"
                value={value.maxValue ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ maxValue: num(e.currentTarget.value) })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!value.onlyPositive}
              disabled={disabled}
              onChange={(e) => onChange({ onlyPositive: e.target.checked })}
            />
            Only positive numbers
          </label>
        </>
      )}

      {isText && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Min length</Label>
              <Input
                type="number"
                value={value.minLength ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ minLength: num(e.currentTarget.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max length</Label>
              <Input
                type="number"
                value={value.maxLength ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ maxLength: num(e.currentTarget.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Pattern (regex)</Label>
            <Input
              value={value.regex ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ regex: e.currentTarget.value })}
              placeholder="e.g. ^[A-Z]{2}\\d{4}$"
            />
          </div>
        </>
      )}

      {isDate && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Earliest</Label>
            <Input
              type="date"
              value={value.minDate ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minDate: e.currentTarget.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Latest</Label>
            <Input
              type="date"
              value={value.maxDate ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ maxDate: e.currentTarget.value || null })}
            />
          </div>
        </div>
      )}

      {isMulti && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Min selected</Label>
            <Input
              type="number"
              value={value.minSelect ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minSelect: num(e.currentTarget.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max selected</Label>
            <Input
              type="number"
              value={value.maxSelect ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ maxSelect: num(e.currentTarget.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
