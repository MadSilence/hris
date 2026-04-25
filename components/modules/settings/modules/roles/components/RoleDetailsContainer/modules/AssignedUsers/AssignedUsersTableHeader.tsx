"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Download, Search } from "lucide-react";

export interface AssignedUsersTableHeaderProps {
  totalCount: number;
  query: string;
  onQueryChange: (v: string) => void;
  onExportClick: () => void;
  manageRulesTrigger: React.ReactNode;
}

export default function AssignedUsersTableHeader({
  totalCount,
  query,
  onQueryChange,
  onExportClick,
  manageRulesTrigger,
}: AssignedUsersTableHeaderProps) {
  const [openSearch, setOpenSearch] = useState(Boolean(query));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpenSearch(Boolean(query));
  }, [query]);

  const openAndFocus = () => {
    setOpenSearch(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeIfEmpty = () => {
    if (!query) setOpenSearch(false);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-medium">Users</div>
        <div className="text-sm text-muted-foreground">{totalCount}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          {!openSearch ? (
            <button
              type="button"
              aria-label="Open search"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-brown-200 text-brown-600 hover:bg-brown-50"
              onClick={openAndFocus}
            >
              <Search className="w-4 h-4"/>
            </button>
          ) : (
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400 w-4 h-4"/>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onBlur={closeIfEmpty}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") return;
                  if (!query) setOpenSearch(false);
                  else inputRef.current?.blur();
                }}
                placeholder="Search users..."
                className="pl-9 w-[260px] h-9"
                inputMode="search"
              />
            </div>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={onExportClick} aria-label="Download">
          <Download className="h-4 w-4"/>
        </Button>

        {manageRulesTrigger}
      </div>
    </div>
  );
}
