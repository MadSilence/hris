"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, FolderAddIcon, StarIcon, Upload01Icon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/desact/dropdown-menu";
import { cn } from "@/lib/cn";
import { SearchBox } from "@/components/ui/SearchBox";

type PersonalDocumentsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  starredOnly: boolean;
  onStarredOnlyChange: (value: boolean) => void;
  hrOnly: boolean;
  onHrOnlyChange: (value: boolean) => void;
  /** The filter is pointless for someone who can only see documents shared with them. */
  showHrOnlyFilter?: boolean;
  onUploadFromLocal: () => void;
  onCreateFolder: () => void;
  /** Hides the Add menu for a reader — the backend would reject the call anyway. */
  canEdit?: boolean;
};

export const PersonalDocumentsToolbar: React.FC<PersonalDocumentsToolbarProps> = ({
  search,
  onSearchChange,
  starredOnly,
  onStarredOnlyChange,
  hrOnly,
  onHrOnlyChange,
  showHrOnlyFilter = false,
  onUploadFromLocal,
  onCreateFolder,
  canEdit = true,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");

  return (
    // Search leads the row — it is what the reader reaches for first — and the primary action is
    // pushed to the far end, next to Trash. The row used to open with the word "Documents" above a
    // tab already called Documents.
    <div className="flex flex-1 items-center gap-3">
      <SearchBox value={search} onChange={onSearchChange}/>

      <Button type="button"
        variant="secondary"
        size="icon"
        aria-label={t("documents.toolbar.starredOnly")}
        aria-pressed={starredOnly}
        title={t("documents.toolbar.starredOnly")}
        onClick={() => onStarredOnlyChange(!starredOnly)}
        className={cn(starredOnly && "border-field bg-subtle")}
 >
        <Icon icon={StarIcon} className={cn("h-4 w-4", starredOnly && "fill-current text-status-pending-icon")} />
      </Button>

      {showHrOnlyFilter && (
        <Button type="button"
          variant="secondary"
          size="icon"
          aria-label={t("documents.toolbar.hrOnly")}
          aria-pressed={hrOnly}
          title={t("documents.toolbar.hrOnly")}
          onClick={() => onHrOnlyChange(!hrOnly)}
          className={cn(hrOnly && "border-field bg-subtle")}
 >
          <Icon icon={ViewOffSlashIcon} className={cn("h-4 w-4", hrOnly && "text-secondary")} />
        </Button>
      )}

      {canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" className="ml-auto">
              <Icon icon={Add01Icon} size="sm" />
              {tCommon("actions.add")}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onCreateFolder} className="cursor-pointer">
              <Icon icon={FolderAddIcon} size="sm" />
              {t("documents.toolbar.addFolder")}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onUploadFromLocal} className="cursor-pointer">
              <Icon icon={Upload01Icon} size="sm" />
              {t("documents.toolbar.uploadDocuments")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
