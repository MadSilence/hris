import * as React from "react";
import { Card } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import Select from "@/components/ui/Select/Select";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Input } from "@/public/desact/src/components/ui/input";
import { RuleAST, RuleCondition, RuleGroup } from "./rules/ruleAst";
import { buildFieldCatalog, FieldGroup, FieldMeta } from "./rules/fieldCatalog";
import { OP_LABEL, OPS_BY_TYPE } from "./rules/operators";

export interface UserConditionsBuilderProps {
  groupsSource: any[];
  value: RuleAST | null;
  onChange: (next: RuleAST) => void;
  readOnly?: boolean;
}

export default function UserConditionsBuilder({
  groupsSource,
  value,
  onChange,
  readOnly = false,
}: UserConditionsBuilderProps) {
  const catalog = React.useMemo<FieldGroup[]>(
    () => buildFieldCatalog(groupsSource || []),
    [groupsSource]
  );
  const ast = value ?? { root: [] };

  const addGroup = () => {
    const next: RuleAST = {
      root: [
        ...ast.root,
        { type: "group", op: "AND", children: [] } as RuleGroup,
      ],
    };
    onChange(next);
  };

  const removeGroup = (idx: number) => {
    const next: RuleAST = { root: ast.root.filter((_, i) => i !== idx) };
    onChange(next);
  };

  const addCondition = (gIdx: number) => {
    const nextGroups = ast.root.map((g, i) =>
      i === gIdx
        ? {
          ...g,
          children: [
            ...g.children,
            {
              type: "condition",
              fieldId: "",
              fieldType: "TEXT",
              operator: "eq",
            } as RuleCondition,
          ],
        }
        : g
    );
    onChange({ root: nextGroups });
  };

  const removeCondition = (gIdx: number, cIdx: number) => {
    const nextGroups = ast.root.map((g, i) =>
      i === gIdx
        ? { ...g, children: g.children.filter((_, j) => j !== cIdx) }
        : g
    );
    onChange({ root: nextGroups });
  };

  // Groups are always AND inside; root acts as OR between groups. No toggle needed.

  const setConditionField = (
    gIdx: number,
    cIdx: number,
    meta: FieldMeta | null
  ) => {
    const nextGroups = ast.root.map((g, i) => {
      if (i !== gIdx) return g;
      const nextChildren = g.children.map((node, j) => {
        if (j !== cIdx || node.type !== "condition") return node;
        if (!meta) return node;
        const ops = OPS_BY_TYPE[meta.type] || ["eq"];
        const op = ops[0];
        return {
          ...node, fieldId: meta.fieldId, fieldType: meta.type, operator: op, value: undefined, values: undefined, valueTo: undefined
        };
      });
      return { ...g, children: nextChildren };
    });
    onChange({ root: nextGroups });
  };

  const setConditionOperator = (
    gIdx: number,
    cIdx: number,
    operator: string
  ) => {
    const nextGroups = ast.root.map((g, i) => {
      if (i !== gIdx) return g;
      const nextChildren = g.children.map((node, j) =>
        j === cIdx && node.type === "condition" ? { ...node, operator, value: undefined, values: undefined, valueTo: undefined } : node
      );
      return { ...g, children: nextChildren };
    });
    onChange({ root: nextGroups });
  };

  const setConditionValue = (
    gIdx: number,
    cIdx: number,
    payload: { value?: string | boolean | number; values?: string[]; valueTo?: string }
  ) => {
    const nextGroups = ast.root.map((g, i) => {
      if (i !== gIdx) return g;
      const nextChildren = g.children.map((node, j) =>
        j === cIdx && node.type === "condition" ? { ...node, ...payload } : node
      );
      return { ...g, children: nextChildren };
    });
    onChange({ root: nextGroups });
  };

  const renderValueInput = (cond: RuleCondition, gIdx: number, cIdx: number, meta: FieldMeta | null) => {
    const op = cond.operator;
    if (!meta) return null;
    if ((meta.type === "SELECT" || meta.type === "STATUS") && (op === "eq")) {
      const options = meta.options || [];
      const value = (cond.value as string) || "";
      return (
        <Select
          label="Value"
          value={value}
          onChange={(v) => setConditionValue(gIdx, cIdx, { value: v })}
          options={[
            { value: "", label: "Select value", disabled: true },
            ...options.map((o) => ({ value: o.id, label: o.label })),
          ]}
        />
      );
    }
    if ((meta.type === "SELECT" || meta.type === "STATUS") && op === "in") {
      const options = meta.options || [];
      const values = cond.values || [];
      return (
        <div className="grid gap-2">
          {(options || []).map((o) => {
            const checked = values.includes(o.id);
            return (
              <label key={o.id} className="flex items-center gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(checkedVal) => {
                    const next = new Set(values);
                    if (checkedVal) next.add(o.id);
                    else next.delete(o.id);
                    setConditionValue(gIdx, cIdx, { values: Array.from(next) });
                  }}
                />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    if (meta.type === "MULTI_SELECT" && op === "has_any") {
      const options = meta.options || [];
      const values = cond.values || [];
      return (
        <div className="grid gap-2">
          {(options || []).map((o) => {
            const checked = values.includes(o.id);
            return (
              <label key={o.id} className="flex items-center gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(checkedVal) => {
                    const next = new Set(values);
                    if (checkedVal) next.add(o.id);
                    else next.delete(o.id);
                    setConditionValue(gIdx, cIdx, { values: Array.from(next) });
                  }}
                />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    if (meta.type === "CHECKBOX" && op === "eq") {
      const val = Boolean(cond.value);
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={val}
            onCheckedChange={(checkedVal) => setConditionValue(gIdx, cIdx, { value: Boolean(checkedVal) })}
          />
          <span>True</span>
        </div>
      );
    }
    if (meta.type === "NUMBER" && op === "between") {
      const v = (cond.value as string) || "";
      const vTo = (cond.valueTo as string) || "";
      return (
        <div className="flex items-center gap-2">
          <Input type="number" value={v} onChange={(e) => setConditionValue(gIdx, cIdx, { value: e.target.value })}/>
          <span>…</span>
          <Input type="number" value={vTo} onChange={(e) => setConditionValue(gIdx, cIdx, { valueTo: e.target.value })}/>
        </div>
      );
    }
    if (meta.type === "DATE" && op === "between") {
      const v = (cond.value as string) || "";
      const vTo = (cond.valueTo as string) || "";
      return (
        <div className="flex items-center gap-2">
          <Input type="date" value={v} onChange={(e) => setConditionValue(gIdx, cIdx, { value: e.target.value })}/>
          <span>…</span>
          <Input type="date" value={vTo} onChange={(e) => setConditionValue(gIdx, cIdx, { valueTo: e.target.value })}/>
        </div>
      );
    }
    const v = (cond.value as string) || "";
    return <Input value={v} onChange={(e) => setConditionValue(gIdx, cIdx, { value: e.target.value })}/>;
  };

  const findFieldMeta = (fieldId: string): FieldMeta | null => {
    for (const g of catalog) {
      const m = g.attributes.find((a) => a.fieldId === fieldId);
      if (m) return m;
    }
    return null;
  };

  const renderConditionRow = (gIdx: number, cIdx: number, cond: RuleCondition) => {
    const fieldMeta = findFieldMeta(cond.fieldId);
    const ops = fieldMeta ? OPS_BY_TYPE[fieldMeta.type] : [];
    return (
      <div className="grid gap-3 p-3" key={`cond-${gIdx}-${cIdx}`}>
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Field"
            value={fieldMeta?.fieldId ?? ""}
            onChange={(v) => {
              const nextMeta =
                catalog.flatMap((gr) => gr.attributes).find((a) => a.fieldId === v) || null;
              setConditionField(gIdx, cIdx, nextMeta);
            }}
            options={[
              { value: "", label: "Select field", disabled: true },
              ...catalog.flatMap((gr) => [
                { value: `__group__:${gr.id}`, label: gr.name, disabled: true },
                ...gr.attributes.map((a) => ({ value: a.fieldId, label: a.label })),
              ]),
            ]}
          />
          <Select
            label="Operator"
            value={cond.operator}
            onChange={(v) => setConditionOperator(gIdx, cIdx, v)}
            options={[
              { value: "", label: "Select operator", disabled: true },
              ...ops.map((o) => ({ value: o, label: OP_LABEL[o as keyof typeof OP_LABEL] || o })),
            ]}
          />
          <div>{renderValueInput(cond, gIdx, cIdx, fieldMeta)}</div>
        </div>
        <div className="flex items-center justify-end">
          {!readOnly && (
            <Button variant="outline" onClick={() => removeCondition(gIdx, cIdx)}>
              Remove condition
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <h3 className="text-lg">Role Assignment</h3>
      {ast.root.map((group, gIdx) => (
        <Card key={`g-${gIdx}`} className="p-4 grid gap-3">
          <div className="flex items-center justify-between">
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => removeGroup(gIdx)}>
                  Remove group
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {group.children
              .map((node, cIdx) => (node.type === "condition" ? renderConditionRow(gIdx, cIdx, node) : null))}
          </div>
          {!readOnly && (
            <div className="flex">
              <Button className="bg-brown-600 text-white hover:bg-brown-700" onClick={() => addCondition(gIdx)}>
                Add condition
              </Button>
            </div>
          )}
        </Card>
      ))}
      {!readOnly && (
        <div className="flex">
          <Button className="bg-brown-600 text-white hover:bg-brown-700" onClick={addGroup}>
            Add group
          </Button>
        </div>
      )}
    </div>
  );
}
