// components/.../FiltersBar/FiltersBar.tsx
"use client";
import React from "react";
import { Filter } from "@/components/models/filters";

type Props = {
  filters: Filter[];
  onChange: (next: Filter[]) => void;
};

const Fields = [
  { key: "status", label: "status", ops: ["eq","in"] as const },
  { key: "is_email_verified", label: "verified", ops: ["eq"] as const },
  { key: "created_at", label: "created", ops: ["after","before","between"] as const },
] as const;

const FiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const add = (f: Filter) => onChange([...filters, f]);
  const remove = (idx: number) => onChange(filters.filter((_, i) => i !== idx));

  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", padding:"8px 12px" }}>
      {filters.map((f, i) => (
        <div key={i} style={{ border:"1px solid hsl(var(--border-primary))", borderRadius:"6px", padding:"4px 8px", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:"var(--font-size-sm)" }}>
            {f.field} {f.op} {renderVal(f)}
          </span>
          <button onClick={() => remove(i)} style={{ border:"none", background:"transparent", cursor:"pointer" }}>✕</button>
        </div>
      ))}

      {/* быстрые добавлялки */}
      <button onClick={() => add({ field:"status", op:"eq", value:"ACTIVE" })}>+ status=ACTIVE</button>
      <button onClick={() => add({ field:"is_email_verified", op:"eq", value:"true" })}>+ verified</button>
      <button onClick={() => add({ field:"created_at", op:"after", value:new Date(Date.now()-30*864e5).toISOString() })}>+ created last 30d</button>
    </div>
  );
};

function renderVal(f: Filter) {
  if (f.values?.length) return `[${f.values.join(", ")}]`;
  if (f.op === "between") return `${f.value}..${f.valueTo}`;
  return f.value ?? "";
}

export default FiltersBar;
