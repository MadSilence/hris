"use client";

import React, { useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Input } from "@/public/desact/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { cn } from "@/public/desact/src/components/ui/utils";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { emptySegment, type UserRefDTO } from "@/models/segment/Segment";

export type PickedUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  value: PickedUser | null;
  onChange: (user: PickedUser | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  id?: string;
};

function fullName(u: { firstName?: string | null; lastName?: string | null; email?: string | null }): string {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return name || u.email || "Unknown";
}

function initials(u: { firstName?: string | null; lastName?: string | null; email?: string | null }): string {
  const a = (u.firstName ?? "").trim();
  const b = (u.lastName ?? "").trim();
  const fromParts = (a ? a[0] : "") + (b ? b[0] : "");
  if (fromParts) return fromParts.toUpperCase();
  return (u.email ?? "?").slice(0, 2).toUpperCase();
}

export function UserPickerField({
  value,
  onChange,
  placeholder = "Select a person",
  allowClear = true,
  disabled,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);

  const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useSegmentResolve(
    emptySegment(),
    open,
    debounced,
  );

  const listRef = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = listRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) void fetchNextPage();
  };

  const select = (u: UserRefDTO) => {
    onChange({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatarUrl: u.avatarUrl,
    });
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-brown-300 bg-input-background px-3 text-sm outline-none transition-colors hover:border-brown-400 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="h-5 w-5 shrink-0">
                {value.avatarUrl ? <AvatarImage src={value.avatarUrl} alt="" /> : null}
                <AvatarFallback className="text-[9px]">{initials(value)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-brown-900">{fullName(value)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}

          <span className="flex flex-none items-center gap-1 text-brown-400">
            {value && allowClear && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="rounded p-0.5 hover:bg-brown-100 hover:text-brown-700"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-60" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b border-brown-100 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search people…"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <div ref={listRef} onScroll={onScroll} className="max-h-64 overflow-y-auto p-1">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-brown-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-brown-400">No people found.</p>
          ) : (
            items.map((u) => {
              const isSelected = value?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => select(u)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-brown-50",
                    isSelected && "bg-brown-50",
                  )}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-[10px]">{initials(u)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-brown-900">{fullName(u)}</span>
                    <span className="block truncate text-xs text-brown-500">{u.email}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 flex-none text-brown-600" />}
                </button>
              );
            })
          )}
          {isFetchingNextPage && (
            <p className="px-2 py-2 text-center text-xs text-brown-400">Loading more…</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
