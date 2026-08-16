"use client";

import React from "react";
import {
  AttributeOption,
  AttributeOptionUpsert,
  AttributeType,
  isOptionsType,
  isUniqueType,
} from "@/models/attribute";
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
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
import { PRESET_COLORS } from "@/models/colors";
import { sortBySortOrder } from "../../hooks/utils/useReorderAction";
import { SettingToggle } from "@/components/modules/settings/modules/attributes/components/shared/SettingToggle";

interface AttributeOptionsProps {
  attribute: Attribute;
  groups?: AttributeGroup[];
  onChange: (patch: AttributePatch) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isPreset?: boolean;
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
}) => {
  // The type is fixed at creation — changing it would have to migrate every stored value between
  // storage columns, so the editor shows it read-only (the backend has no `type` on its update
  // request either, so the old picker silently did nothing).
  const type = attribute.type as AttributeType;

  const [name, setName] = React.useState<string>(attribute.name);
  const [groupId, setGroupId] = React.useState<string>(attribute.groupId);
  const [uniqueId, setUniqueId] = React.useState<boolean>((attribute as { unique?: boolean }).unique ?? false);
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
        color: o.color ?? PRESET_COLORS[0],
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
          color: PRESET_COLORS[0],
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
    if (isUniqueType(type)) patch.unique = uniqueId;
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
    setUniqueId((attribute as { unique?: boolean }).unique ?? false);
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
        <Label htmlFor="attr-name">Name</Label>
        <Input
          id="attr-name"
          value={name}
          disabled={isPreset}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {!name.trim() && (
          <p className="text-xs text-destructive">A name is required.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <div className="flex items-center gap-2">
          <AttributeTypeChip type={type} />
          <span className="text-xs text-muted-foreground">
            Can&apos;t be changed after the attribute is created.
          </span>
        </div>
      </div>

      {groupOptions.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-group">Group</Label>
          <Select value={groupId} onValueChange={setGroupId} disabled={isPreset}>
            <SelectTrigger id="attr-group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupOptions.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {groupId !== attribute.groupId && (
            <p className="text-xs text-muted-foreground">
              Moving the attribute places it at the end of the target group.
            </p>
          )}
        </div>
      )}

      {needsOptions && (
        <div className="space-y-1.5">
          <Label>Options</Label>
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
          label="Hide the year"
          hint="Show only day and month (e.g. for birthdays)."
          checked={hideYear}
          onCheckedChange={setHideYear}
          disabled={isPreset}
        />
      )}

      {isUniqueType(type) && (
        <SettingToggle
          label="Unique value"
          hint="No two people can have the same value."
          checked={uniqueId}
          onCheckedChange={setUniqueId}
          disabled={isPreset}
        />
      )}

      <SettingToggle
        label="Sensitive"
        hint="People without access to this field see a placeholder instead of the value."
        checked={sensitive}
        onCheckedChange={setSensitive}
        disabled={isPreset}
      />

      {type === AttributeType.NUMBER && (
        <div className="space-y-1.5">
          <Label htmlFor="attr-dec-scale">Decimal scale</Label>
          <Input
            id="attr-dec-scale"
            type="number"
            min={0}
            value={decScale ?? ""}
            disabled={isPreset}
            placeholder="e.g. 2 — leave empty for whole numbers"
            onChange={(e) => {
              const v = e.currentTarget.value;
              setDecScale(v === "" ? null : Number(v));
            }}
          />
          <p className="text-xs text-muted-foreground">
            Chooses how new values are stored (decimal vs whole numbers). Values saved earlier keep
            their current form.
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

      <div className="mt-6 flex justify-end gap-2 border-t border-brown-100 pt-4">
        <Button variant="outline" onClick={cancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={isPreset || !name.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
};
