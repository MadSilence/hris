"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Delete02Icon, FileImportIcon, FolderAddIcon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/desact/dropdown-menu";
import { SearchBox } from "@/components/ui/SearchBox";

type PersonalDocumentsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onUploadFromLocal: () => void;
  onCreateFolder: () => void;
  /** Hides the Add menu for a reader — the backend would reject the call anyway. */
  canEdit?: boolean;
  /** "Request" beside Add (documents-requests R05): only for those who may ask the person for documents. */
  onRequest?: () => void;
  /** Trash, a secondary button with its label (documents-tab § 1); absent for those who cannot manage. */
  onOpenTrash?: () => void;
};

/**
 * The tab's toolbar (documents-tab § 1): Search on the left, 260 wide; on the right Trash, then Request where it is
 * offered, then Add — Upload files · New folder. The views replaced the starred toggle; Who can see sorts instead of
 * filtering.
 */
export const PersonalDocumentsToolbar: React.FC<PersonalDocumentsToolbarProps> = ({
  search,
  onSearchChange,
  onUploadFromLocal,
  onCreateFolder,
  canEdit = true,
  onRequest,
  onOpenTrash,
}) => {
  const tSigning = useTranslations("signing");
  const t = useTranslations("organization");

  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="w-[260px] max-w-full">
        <SearchBox value={search} onChange={onSearchChange} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {onOpenTrash && (
          <Button type="button" variant="secondary" onClick={onOpenTrash}>
            <Icon icon={Delete02Icon} size="sm" />
            {t("documents.container.trash")}
          </Button>
        )}
        {onRequest && (
          <Button type="button" variant="secondary" onClick={onRequest}>
            <Icon icon={FileImportIcon} size="sm" />
            {tSigning("section.request")}
          </Button>
        )}
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button">
                <Icon icon={Add01Icon} size="sm" />
                {t("documents.container.add")}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onUploadFromLocal} className="cursor-pointer">
                <Icon icon={Upload01Icon} size="sm" />
                {t("documents.container.uploadFiles")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateFolder} className="cursor-pointer">
                <Icon icon={FolderAddIcon} size="sm" />
                {t("documents.container.newFolder")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
