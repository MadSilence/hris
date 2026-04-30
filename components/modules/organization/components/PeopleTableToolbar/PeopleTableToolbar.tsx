"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";

type PeopleTableToolbarProps = {
  query: string;
  onQueryChange: (v: string) => void;
  rowsCount?: number;
  isSearching?: boolean;
};

const PeopleTableToolbar: React.FC<PeopleTableToolbarProps> = ({
  query,
  onQueryChange,
  rowsCount,
  isSearching,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search by name or email"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        inputMode="search"
        className="h-9 max-w-sm"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => onQueryChange("")}
        disabled={!query}
      >
        Clear
      </Button>

      <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
        {isSearching
          ? "Searching…"
          : rowsCount !== undefined
            ? `${rowsCount} rows`
            : ""}
      </div>
    </div>
  );
};

export default PeopleTableToolbar;
