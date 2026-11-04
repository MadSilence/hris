"use client";

import React from "react";
import { ArrowDown01Icon, ArrowUp01Icon, Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Input } from "@/components/desact/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { cn } from "@/lib/cn";

export type SearchFieldMode = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Optional left-hand switch: what the query is searched against. */
  modes?: SearchFieldMode[];
  mode?: string;
  onModeChange?: (mode: string) => void;
  /** Match navigation. Omit matchCount to hide the counter entirely. */
  matchCount?: number;
  activeMatch?: number;
  onPrev?: () => void;
  onNext?: () => void;
};

/**
 * Plain search box: optional mode switch, a counter and prev/next arrows. Knows nothing about what
 * is being searched — callers own the matching.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  className,
  modes,
  mode,
  onModeChange,
  matchCount,
  activeMatch,
  onPrev,
  onNext,
}: Props) {
  const hasQuery = value.length > 0;
  const showCounter = matchCount !== undefined && hasQuery;

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-1 rounded-control border border-divider bg-card pr-1",
        className,
      )}
    >
      {modes && modes.length > 1 && (
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger
            aria-label="Search in"
            className="h-7 w-[124px] flex-none border-0 bg-transparent pl-2.5 text-body shadow-none focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modes.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="relative min-w-0 flex-1">
        <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-tertiary" />
        <Input
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (e.shiftKey) onPrev?.();
              else onNext?.();
            }
            if (e.key === "Escape" && hasQuery) {
              e.preventDefault();
              onChange("");
            }
          }}
          className="h-7 border-0 pl-7 text-body shadow-none focus-visible:ring-0"
        />
      </div>

      {showCounter && (
        <span className="flex-none whitespace-nowrap px-1 text-hint tabular-nums text-tertiary">
          {matchCount === 0 ? "0 results" : `${activeMatch ?? 1} of ${matchCount}`}
        </span>
      )}

      {showCounter && matchCount > 1 && (
        <span className="flex flex-none items-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous match"
            className="flex h-6 w-6 items-center justify-center rounded-tag text-tertiary hover:bg-mist hover:text-secondary"
          >
            <Icon icon={ArrowUp01Icon} size="sm" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next match"
            className="flex h-6 w-6 items-center justify-center rounded-tag text-tertiary hover:bg-mist hover:text-secondary"
          >
            <Icon icon={ArrowDown01Icon} size="sm" />
          </button>
        </span>
      )}

      {hasQuery && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex h-6 w-6 flex-none items-center justify-center rounded-tag text-tertiary hover:bg-mist hover:text-secondary"
        >
          <Icon icon={Cancel01Icon} size="sm" />
        </button>
      )}
    </div>
  );
}
