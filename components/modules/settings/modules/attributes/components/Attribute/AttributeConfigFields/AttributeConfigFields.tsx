"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { AttributeType, hasDefaultValueSupport, isTextConstrainedType } from "@/models/attribute";
import { SettingToggle } from "@/components/modules/settings/modules/attributes/components/shared/SettingToggle";
import { DatePicker } from "@/components/ui/DatePicker";

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
  const isText = isTextConstrainedType(type);
  const isLongText = type === AttributeType.LONG_TEXT;
  const isDate = type === AttributeType.DATE;
  const isMulti = type === AttributeType.MULTI_SELECT;
  const hasDefault = hasDefaultValueSupport(type);

  const defaultInputType = isNumber ? "number" : isDate ? "date" : "text";

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brown-400">
        Validation &amp; rules
      </p>

      {/*
        * "Required" promised something the product does not do. Nothing forces a value to exist —
        * the field can be left empty on creation and stays empty — what the flag prevents is
        * *clearing* a value that is already there, which is what both sides enforce
        * (`fieldError`: "This field cannot be cleared."). Required-by-stage is the feature that
        * would make the old label true, and it is deliberately not built: it needs lifecycle stages
        * and an outstanding-items screen.
        */}
      <SettingToggle
        label="Cannot be cleared"
        hint="Once this field has a value, it cannot be emptied again. It does not have to be filled in."
        checked={!!value.required}
        onCheckedChange={(v) => onChange({ required: v })}
        disabled={disabled}
      />

      <div className="space-y-1.5">
        <Label htmlFor="attr-cfg-description">Description</Label>
        <Textarea
          id="attr-cfg-description"
          value={value.description ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ description: e.currentTarget.value })}
          placeholder="Help text shown under the field on the profile"
          className="min-h-16"
        />
      </div>

      {hasDefault && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-cfg-default">Default value</Label>
          <Input
            id="attr-cfg-default"
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
              <Label htmlFor="attr-cfg-min">Min</Label>
              <Input
                type="number"
                id="attr-cfg-min"
                value={value.minValue ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ minValue: num(e.currentTarget.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attr-cfg-max">Max</Label>
              <Input
                type="number"
                id="attr-cfg-max"
                value={value.maxValue ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ maxValue: num(e.currentTarget.value) })}
              />
            </div>
          </div>
          <SettingToggle
            label="Only positive numbers"
            checked={!!value.onlyPositive}
            onCheckedChange={(v) => onChange({ onlyPositive: v })}
            disabled={disabled}
          />
        </>
      )}

      {(isText || isLongText) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-min-length">Min length</Label>
            <Input
              type="number"
              id="attr-cfg-min-length"
              value={value.minLength ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minLength: num(e.currentTarget.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-length">Max length</Label>
            <Input
              type="number"
              id="attr-cfg-max-length"
              value={value.maxLength ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ maxLength: num(e.currentTarget.value) })}
            />
          </div>
        </div>
      )}

      {isText && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-cfg-regex">Pattern (regex)</Label>
          <Input
            id="attr-cfg-regex"
            value={value.regex ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ regex: e.currentTarget.value })}
            placeholder="e.g. ^[A-Z]{2}\\d{4}$"
          />
          {type === AttributeType.PHONE && (
            <p className="text-xs text-muted-foreground">
              Phone numbers are always checked for 7–15 digits. A pattern adds a stricter format on top.
            </p>
          )}
        </div>
      )}

      {isDate && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-min-date">Earliest</Label>
            <DatePicker
              id="attr-cfg-min-date"
              value={value.minDate ?? ""}
              disabled={disabled}
              onChange={(next) => onChange({ minDate: next || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-date">Latest</Label>
            <DatePicker
              id="attr-cfg-max-date"
              value={value.maxDate ?? ""}
              disabled={disabled}
              min={value.minDate ?? undefined}
              onChange={(next) => onChange({ maxDate: next || null })}
            />
          </div>
        </div>
      )}

      {isMulti && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-min-select">Min selected</Label>
            <Input
              type="number"
              id="attr-cfg-min-select"
              value={value.minSelect ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minSelect: num(e.currentTarget.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-select">Max selected</Label>
            <Input
              type="number"
              id="attr-cfg-max-select"
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
