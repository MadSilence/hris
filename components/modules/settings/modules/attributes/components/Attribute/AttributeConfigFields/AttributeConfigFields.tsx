"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
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
  const t = useTranslations("settings.attributes.config");
  const tCommon = useTranslations("common");

  const defaultInputType = isNumber ? "number" : isDate ? "date" : "text";

  return (
    <div className="space-y-4">
      <p className="text-hint font-semibold text-tertiary">
        {t("validationTitle")}
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
        label={t("cannotBeCleared")}
        hint={t("cannotBeClearedHint")}
        checked={!!value.required}
        onCheckedChange={(v) => onChange({ required: v })}
        disabled={disabled}
      />

      <div className="space-y-1.5">
        <Label htmlFor="attr-cfg-description">{tCommon("fields.description")}</Label>
        <Textarea
          id="attr-cfg-description"
          value={value.description ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ description: e.currentTarget.value })}
          className="min-h-16"
        />
      </div>

      {hasDefault && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-cfg-default">{t("defaultValue")}</Label>
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
              <Label htmlFor="attr-cfg-min">{t("min")}</Label>
              <Input
                type="number"
                id="attr-cfg-min"
                value={value.minValue ?? ""}
                disabled={disabled}
                onChange={(e) => onChange({ minValue: num(e.currentTarget.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attr-cfg-max">{t("max")}</Label>
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
            label={t("onlyPositive")}
            checked={!!value.onlyPositive}
            onCheckedChange={(v) => onChange({ onlyPositive: v })}
            disabled={disabled}
          />
        </>
      )}

      {(isText || isLongText) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-min-length">{t("minLength")}</Label>
            <Input
              type="number"
              id="attr-cfg-min-length"
              value={value.minLength ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minLength: num(e.currentTarget.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-length">{t("maxLength")}</Label>
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
          <Label htmlFor="attr-cfg-regex">{t("pattern")}</Label>
          <Input
            id="attr-cfg-regex"
            value={value.regex ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ regex: e.currentTarget.value })}
          />
          {type === AttributeType.PHONE && (
            <p className="text-hint text-tertiary">
              {t("phoneHint")}
            </p>
          )}
        </div>
      )}

      {isDate && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-min-date">{t("earliest")}</Label>
            <DatePicker
              id="attr-cfg-min-date"
              value={value.minDate ?? ""}
              disabled={disabled}
              onChange={(next) => onChange({ minDate: next || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-date">{t("latest")}</Label>
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
            <Label htmlFor="attr-cfg-min-select">{t("minSelected")}</Label>
            <Input
              type="number"
              id="attr-cfg-min-select"
              value={value.minSelect ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ minSelect: num(e.currentTarget.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attr-cfg-max-select">{t("maxSelected")}</Label>
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
