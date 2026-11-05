"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { cn } from "@/lib/cn";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { emptySegment, type UserRefDTO } from "@/models/segment/Segment";
import { SearchBox } from "@/components/ui/SearchBox";
import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { NodRing } from "@/components/desact/nod";

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
  /**
   * A read route that answers `?q=` with people, used instead of the directory's search — for a picker an ordinary
   * employee must be able to use whatever their directory rights (the Nominate Peers page, REVIEWS_PLAN.md 11.0).
   */
  searchPath?: string;
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

/** People from a scoped read route ({@code searchPath}), one page: the route caps what it answers. */
function usePathSearch(path: string | undefined, open: boolean, q: string) {
  const { internalApiClient } = useAppDataContext();
  const term = q.trim().length >= 2 ? q.trim() : "";
  const query = useQuery<UserRefDTO[]>({
    queryKey: ["USER_PICKER_SEARCH", path, term],
    queryFn: () => internalApiClient.get<UserRefDTO[]>(term ? `${path}?q=${encodeURIComponent(term)}` : path ?? ""),
    enabled: Boolean(path) && open,
  });
  return { items: query.data ?? [], isLoading: query.isLoading };
}

export function UserPickerField({
  value,
  onChange,
  placeholder,
  allowClear = true,
  disabled,
  id,
  searchPath,
}: Props) {
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);

  const directory = useSegmentResolve(emptySegment(), open && !searchPath, debounced);
  const scoped = usePathSearch(searchPath, open, debounced);
  const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = searchPath
    ? { ...scoped, hasNextPage: false, isFetchingNextPage: false, fetchNextPage: () => Promise.resolve() }
    : directory;

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
            "flex h-9 w-full items-center justify-between gap-2 rounded-control border border-field bg-card px-3 text-body outline-none transition-colors hover:border-strong disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="h-5 w-5 shrink-0">
                {value.avatarUrl ? <AvatarImage src={value.avatarUrl} alt="" /> : null}
                <AvatarFallback className="text-hint">{initials(value)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-primary">{fullName(value)}</span>
            </span>
          ) : (
            <span className="text-tertiary">{placeholder ?? t("shared.userPicker.placeholder")}</span>
          )}

          <span className="flex flex-none items-center gap-1 text-tertiary">
            {value && allowClear && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label={t("shared.userPicker.clear")}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="rounded-control p-0.5 hover:bg-mist hover:text-secondary"
              >
                <Icon icon={Cancel01Icon} size="sm" />
              </span>
            )}
            <Icon icon={UnfoldMoreIcon} size="sm" className="opacity-60" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b border-divider p-2">
          <SearchBox value={query} onChange={setQuery}/>
        </div>

        <div ref={listRef} onScroll={onScroll} className="max-h-64 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex justify-center px-2 py-6"><NodRing size="md" /></div>
          ) : items.length === 0 ? (
            <p className="px-2 py-6 text-center text-body text-tertiary">{t("shared.userPicker.empty")}</p>
          ) : (
            items.map((u) => {
              const isSelected = value?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => select(u)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-subtle",
                    isSelected && "bg-subtle",
                  )}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-hint">{initials(u)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-primary">{fullName(u)}</span>
                    <span className="block truncate text-hint text-tertiary">{u.email}</span>
                  </span>
                  {isSelected && <Icon icon={Tick02Icon} size="sm" className="flex-none text-secondary" />}
                </button>
              );
            })
          )}
          {isFetchingNextPage && (
            <p className="px-2 py-2 text-center text-hint text-tertiary">{t("shared.userPicker.loadingMore")}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
