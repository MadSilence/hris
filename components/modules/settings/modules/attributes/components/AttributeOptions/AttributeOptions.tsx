"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  AttributeOption,
  AttributeOptionUpsert,
  AttributeType,
  isOptionsType,
  isUniqueType,
} from "@/models/attribute";
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { OptionsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor";
import { ObjectFieldsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/ObjectFieldsEditor/ObjectFieldsEditor";
import { AttributeTypeChip } from "@/components/modules/settings/modules/attributes/components/AttributeTypeChip/AttributeTypeChip";
import {
  AttributeConfigFields,
  AttributeConfig,
} from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeConfigFields";
import {
  ObjectFieldDef,
  parseObjectFields,
  serializeObjectFields,
} from "@/models/attribute/objectFields";
import { TAG_COLOR_SEQUENCE } from "@/lib/theme/tags";
import { sortBySortOrder } from "../../hooks/utils/useReorderAction";
import { SettingToggle } from "@/components/modules/settings/modules/attributes/components/shared/SettingToggle";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FieldError } from "@/components/desact/field-error";

interface AttributeOptionsProps {
  attribute: Attribute;
  groups?: AttributeGroup[];
  onChange: (patch: AttributePatch) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isPreset?: boolean;
  /** A save is in flight — Save is held off so a second click cannot race the first. */
  isSaving?: boolean;
}

// Config fields the backend can reset to NULL on request (mirrors AttributeUpdateService.CLEARABLE_FIELDS).
const CLEARABLE_CONFIG_KEYS = [
  "description",
  "defaultValue",
  "minValue",
  "maxValue",
  "minLength",
  "maxLength",
  "regex",
  "minDate",
  "maxDate",
  "minSelect",
  "maxSelect",
] as const satisfies readonly (keyof AttributeConfig)[];

const isBlank = (v: unknown) => v === null || v === undefined || v === "";


export const AttributeOptions: React.FC<AttributeOptionsProps> = ({
  attribute,
  groups,
  onChange,
  onSave,
  onCancel,
  isPreset = false,
  isSaving = false,
}) => {
  const t = useTranslations("settings.attributes.form");
  const tEdit = useTranslations("settings.attributes.editForm");
  const tCommon = useTranslations("common");
  // The type is fixed at creation — changing it would have to migrate every stored value between
  // storage columns, so the editor shows it read-only (the backend has no `type` on its update
  // request either, so the old picker silently did nothing).
  const type = attribute.type as AttributeType;

  const [name, setName] = React.useState<string>(attribute.name);
  const [groupId, setGroupId] = React.useState<string>(attribute.groupId);
  const [uniqueId, setUniqueId] = React.useState<boolean>(attribute.isUnique ?? false);
  const [sensitive, setSensitive] = React.useState<boolean>(attribute.sensitive ?? false);
  const [hideYear, setHideYear] = React.useState<boolean>(
    (attribute as { dateHideYear?: boolean }).dateHideYear ?? false,
  );
  const [decScale, setDecScale] = React.useState<number | null>(attribute.decScale ?? null);
  const [editorOptions, setEditorOptions] = React.useState<AttributeOptionUpsert[]>([]);
  const [objectFields, setObjectFields] = React.useState<ObjectFieldDef[]>(() =>
    parseObjectFields((attribute as { objectFields?: string | null }).objectFields),
  );

  React.useEffect(() => {
    setObjectFields(parseObjectFields((attribute as { objectFields?: string | null }).objectFields));
  }, [attribute]);

  const readConfig = (a: Attribute): AttributeConfig => ({
    required: a.required ?? false,
    description: a.description ?? null,
    defaultValue: a.defaultValue ?? null,
    minValue: a.minValue ?? null,
    maxValue: a.maxValue ?? null,
    onlyPositive: a.onlyPositive ?? false,
    minLength: a.minLength ?? null,
    maxLength: a.maxLength ?? null,
    regex: a.regex ?? null,
    minDate: a.minDate ?? null,
    maxDate: a.maxDate ?? null,
    minSelect: a.minSelect ?? null,
    maxSelect: a.maxSelect ?? null,
  });
  const [config, setConfig] = React.useState<AttributeConfig>(readConfig(attribute));

  React.useEffect(() => {
    setConfig(readConfig(attribute));
    setName(attribute.name);
    setGroupId(attribute.groupId);
    setDecScale(attribute.decScale ?? null);
    setSensitive(attribute.sensitive ?? false);
  }, [attribute]);

  React.useEffect(() => {
    const raw = Array.isArray(attribute.options) ? attribute.options : [];
    const upsert = raw
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((o): AttributeOptionUpsert => ({
        id: o.id,
        value: o.value ?? "",
        color: o.color ?? TAG_COLOR_SEQUENCE[0],
        sortOrder: o.sortOrder ?? 0,
      }));

    setEditorOptions(upsert);
  }, [attribute]);

  const initialOptions = React.useMemo<AttributeOption[]>(
    () => sortBySortOrder(Array.isArray(attribute.options) ? attribute.options : []),
    [attribute]
  );

  const [options, setOptions] = React.useState<AttributeOption[]>(initialOptions);

  React.useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const needsOptions = isOptionsType(type);

  React.useEffect(() => {
    if (needsOptions && options.length === 0) {
      setOptions([
        {
          id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9),
          value: "",
          color: TAG_COLOR_SEQUENCE[0],
          sortOrder: 1,
          createdAt: "",
          createdBy: "",
          updatedAt: "",
          updatedBy: "",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsOptions]);

  const groupOptions = React.useMemo(
    () => sortBySortOrder(groups ?? []),
    [groups]
  );

  const save = () => {
    const patch: AttributePatch = {};

    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== attribute.name) patch.name = trimmedName;
    if (groupId && groupId !== attribute.groupId) patch.groupId = groupId;
    if (type === AttributeType.DATE) patch.dateHideYear = hideYear;
    if (isUniqueType(type)) patch.isUnique = uniqueId;
    patch.sensitive = sensitive;
    if (type === AttributeType.NUMBER) patch.decScale = decScale;
    if (type === AttributeType.OBJECT) patch.objectFields = serializeObjectFields(objectFields);

    // A null in the patch means "leave as is" server-side, so emptying a constraint has to be sent
    // as an explicit clear instead.
    const clearFields = CLEARABLE_CONFIG_KEYS.filter(
      (key) => !isBlank(attribute[key]) && isBlank(config[key])
    ) as string[];
    if (type === AttributeType.NUMBER && attribute.decScale != null && decScale == null) {
      clearFields.push("decScale");
    }
    if (clearFields.length > 0) patch.clearFields = clearFields;

    if (needsOptions) {
      patch.options = editorOptions.map((o) => ({
        ...(o.id ? { id: o.id } : {}),
        value: o.value,
        color: o.color,
        sortOrder: o.sortOrder,
      }));
    }

    Object.assign(patch, config);

    onChange(patch);
    onSave?.();
  };

  const cancel = () => {
    setName(attribute.name);
    setGroupId(attribute.groupId);
    setUniqueId(attribute.isUnique ?? false);
    setSensitive(attribute.sensitive ?? false);
    setHideYear((attribute as { dateHideYear?: boolean }).dateHideYear ?? false);
    setDecScale(attribute.decScale ?? null);
    setOptions(initialOptions);
    onCancel?.();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-1 min-h-0 flex-1 space-y-5 overflow-y-auto px-1 py-1">
      <div className="space-y-1.5">
        <RequiredLabel htmlFor="attr-name" required>{tCommon("fields.name")}</RequiredLabel>
        <Input
          id="attr-name"
          value={name}
          disabled={isPreset}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {!name.trim() && (
          <FieldError>{tEdit("nameRequired")}</FieldError>
        )}
      </div>

      <div className="space-y-1.5">
        <RequiredLabel required>{tCommon("fields.type")}</RequiredLabel>
        <div className="flex items-center gap-2">
          <AttributeTypeChip type={type} />
          <span className="text-hint text-tertiary">
            {tEdit("typeLocked")}
          </span>
        </div>
      </div>

      {groupOptions.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-group">{tEdit("group")}</Label>
          <SearchableSelect
            id="attr-group"
            options={groupOptions.map((g) => ({ value: g.id, label: g.name }))}
            value={groupId || null}
            onChange={(v) => v && setGroupId(v)}
            disabled={isPreset}
            clearable={false}
          />
          {groupId !== attribute.groupId && (
            <p className="text-hint text-tertiary">
              {tEdit("moveHint")}
            </p>
          )}
        </div>
      )}

      {needsOptions && (
        <div className="space-y-1.5">
          <Label>{t("options")}</Label>
          <OptionsEditor
            disabled={isPreset}
            type={type}
            options={Array.isArray(attribute.options) ? attribute.options : []}
            onChange={setEditorOptions}
          />
        </div>
      )}

      {type === AttributeType.OBJECT && (
        <ObjectFieldsEditor fields={objectFields} onChange={setObjectFields} disabled={isPreset} />
      )}

      {type === AttributeType.DATE && (
        <SettingToggle
          label={t("hideYear")}
          hint={t("hideYearHint")}
          checked={hideYear}
          onCheckedChange={setHideYear}
          disabled={isPreset}
        />
      )}

      {isUniqueType(type) && (
        <SettingToggle
          label={t("unique")}
          hint={t("uniqueHint")}
          checked={uniqueId}
          onCheckedChange={setUniqueId}
          disabled={isPreset}
        />
      )}

      <SettingToggle
        label={t("sensitive")}
        hint={t("sensitiveHint")}
        checked={sensitive}
        onCheckedChange={setSensitive}
        disabled={isPreset}
      />

      {type === AttributeType.NUMBER && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-dec-scale">{t("decScale")}</Label>
          <Input
            id="attr-dec-scale"
            type="number"
            min={0}
            value={decScale ?? ""}
            disabled={isPreset}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setDecScale(v === "" ? null : Number(v));
            }}
          />
          <p className="text-hint text-tertiary">
            {tEdit("decScaleHint")}
          </p>
        </div>
      )}

      <AttributeConfigFields
        type={type}
        value={config}
        disabled={isPreset}
        onChange={(patch) => setConfig((c) => ({ ...c, ...patch }))}
      />

      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-divider pt-4">
        <Button type="button" variant="secondary" onClick={cancel} disabled={isSaving}>
          {tCommon("actions.cancel")}
        </Button>
        <Button type="button" onClick={save} disabled={isPreset || !name.trim() || isSaving}>
          {tCommon("actions.save")}
        </Button>
      </div>
    </div>
  );
};
