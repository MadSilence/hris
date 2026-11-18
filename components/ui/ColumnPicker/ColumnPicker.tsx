"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { LayoutTwoColumnIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { cn } from "@/lib/cn";

export type PickableColumn = { key: string; label: string };

/**
 * The column picker (documents-tab T22–T23): an icon at the end of a table's header row and a menu of checkboxes. The
 * first column (the name) is not offered — it always stays. The icon is tinted while any column is hidden.
 */
export const ColumnPicker: React.FC<{
  columns: PickableColumn[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
}> = ({ columns, hidden, onChange }) => {
  const t = useTranslations("common");
  const anyHidden = columns.some((c) => hidden.includes(c.key));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("columns.pick")}
          title={t("columns.pick")}
          className={cn("size-8", anyHidden && "text-accent-text")}
        >
          <Icon icon={LayoutTwoColumnIcon} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("columns.title")}</DropdownMenuLabel>
        {columns.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.key}
            checked={!hidden.includes(c.key)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(on) => onChange(on ? hidden.filter((k) => k !== c.key) : [...hidden, c.key])}
          >
            {c.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
