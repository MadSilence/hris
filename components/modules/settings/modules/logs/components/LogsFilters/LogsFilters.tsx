"use client";

import * as React from "react";
import { X } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import type { ActivityCatalog, ActivityLogFilters } from "@/models/activityLog";

const ANY = "__any__";

/**
 * The filters over what a row is actually stored by.
 *
 * <p><b>The action select is grouped by module</b> — the same fourteen headings the catalogue is
 * written in. There are close to two hundred actions; one flat list of them is a scrollbar and a
 * guess, and the module a person is thinking of is the first thing they know.
 *
 * <p>Deliberately not offered: a free-text filter over the metadata. What a row carries varies by
 * event, and a box that searches "sometimes" is worse than one that says what it searches — the
 * search here matches the three names snapshotted on the row.
 */
export const LogsFilters: React.FC<{
  catalog: ActivityCatalog | undefined;
  value: ActivityLogFilters;
  onChange: (next: ActivityLogFilters) => void;
}> = ({ catalog, value, onChange }) => {
  const set = (patch: Partial<ActivityLogFilters>) => onChange({ ...value, ...patch });

  const actionsByModule = React.useMemo(() => {
    const grouped = new Map<string, { code: string; label: string }[]>();
    (catalog?.actions ?? []).forEach((action) => {
      const list = grouped.get(action.module) ?? [];
      list.push({ code: action.code, label: action.label });
      grouped.set(action.module, list);
    });
    return grouped;
  }, [catalog]);

  const moduleLabel = (code: string) =>
    catalog?.modules.find((module) => module.code === code)?.label ?? code;

  const active =
    Boolean(value.module || value.action || value.verb || value.actorType || value.from || value.to);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* The one shared date field: a raw <input type="date"> is gone from this codebase. */}
      <DatePicker
        value={value.from?.slice(0, 10) ?? ""}
        onChange={(date) => set({ from: date ? `${date}T00:00:00` : undefined })}
        placeholder="From"
        className="w-[9.5rem]"
      />
      <DatePicker
        value={value.to?.slice(0, 10) ?? ""}
        onChange={(date) => set({ to: date ? `${date}T23:59:59` : undefined })}
        placeholder="To"
        className="w-[9.5rem]"
      />

      <Select
        value={value.module ?? ANY}
        onValueChange={(next) => set({ module: next === ANY ? undefined : next, action: undefined })}
      >
        <SelectTrigger className="w-[11rem]">
          <SelectValue placeholder="Module"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All modules</SelectItem>
          {(catalog?.modules ?? []).map((module) => (
            <SelectItem key={module.code} value={module.code}>
              {module.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.action ?? ANY}
        onValueChange={(next) => set({ action: next === ANY ? undefined : next })}
      >
        <SelectTrigger className="w-[15rem]">
          <SelectValue placeholder="Action"/>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectItem value={ANY}>All actions</SelectItem>
          {[...actionsByModule.entries()]
            .filter(([module]) => !value.module || module === value.module)
            .map(([module, actions]) => (
              <SelectGroup key={module}>
                <SelectLabel>{moduleLabel(module)}</SelectLabel>
                {actions.map((action) => (
                  <SelectItem key={action.code} value={action.code}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
        </SelectContent>
      </Select>

      <Select
        value={value.verb ?? ANY}
        onValueChange={(next) => set({ verb: next === ANY ? undefined : next })}
      >
        <SelectTrigger className="w-[11rem]">
          <SelectValue placeholder="Kind"/>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {/* The question the page is opened for on a bad day: every deletion, anywhere. */}
          <SelectItem value={ANY}>Anything done</SelectItem>
          {(catalog?.verbs ?? []).map((verb) => (
            <SelectItem key={verb.code} value={verb.code}>
              {verb.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.actorType ?? ANY}
        onValueChange={(next) => set({ actorType: next === ANY ? undefined : next })}
      >
        <SelectTrigger className="w-[10rem]">
          <SelectValue placeholder="Done by"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Anyone</SelectItem>
          <SelectItem value="USER">A person</SelectItem>
          <SelectItem value="SYSTEM">The system</SelectItem>
          <SelectItem value="INTEGRATION">An integration</SelectItem>
        </SelectContent>
      </Select>

      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({ search: value.search, targetUserId: value.targetUserId, objectType: undefined })
          }
        >
          <X className="mr-1 h-3.5 w-3.5"/>
          Clear
        </Button>
      )}
    </div>
  );
};
