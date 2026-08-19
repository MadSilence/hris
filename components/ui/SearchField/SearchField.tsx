"use client";

import React from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { cn } from "@/public/desact/src/components/ui/utils";

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
        "flex h-9 items-center gap-1 rounded-lg border border-brown-200 bg-white pr-1",
        className,
      )}
    >
      {modes && modes.length > 1 && (
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger
            aria-label="Search in"
            className="h-7 w-[124px] flex-none border-0 bg-transparent pl-2.5 text-sm shadow-none focus:ring-0"
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
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-400" />
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
          className="h-7 border-0 pl-7 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {showCounter && (
        <span className="flex-none whitespace-nowrap px-1 text-xs tabular-nums text-brown-500">
          {matchCount === 0 ? "0 results" : `${activeMatch ?? 1} of ${matchCount}`}
        </span>
      )}

      {showCounter && matchCount > 1 && (
        <span className="flex flex-none items-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous match"
            className="flex h-6 w-6 items-center justify-center rounded text-brown-400 hover:bg-brown-100 hover:text-brown-700"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next match"
            className="flex h-6 w-6 items-center justify-center rounded text-brown-400 hover:bg-brown-100 hover:text-brown-700"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {hasQuery && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex h-6 w-6 flex-none items-center justify-center rounded text-brown-400 hover:bg-brown-100 hover:text-brown-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
