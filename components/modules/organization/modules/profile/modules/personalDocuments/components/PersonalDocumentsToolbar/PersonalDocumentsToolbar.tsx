"use client";

import * as React from "react";
import { EyeOff, FolderPlus, Plus, Star, Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import { cn } from "@/public/desact/src/components/ui/utils";
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
  return (
    // Search leads the row — it is what the reader reaches for first — and the primary action is
    // pushed to the far end, next to Trash. The row used to open with the word "Documents" above a
    // tab already called Documents.
    <div className="flex flex-1 items-center gap-3">
      <SearchBox value={search} onChange={onSearchChange}/>

      <Button
        variant="outline"
        size="icon"
        aria-label="Show starred only"
        aria-pressed={starredOnly}
        title="Show starred only"
        onClick={() => onStarredOnlyChange(!starredOnly)}
        className={cn(starredOnly && "border-brown-300 bg-brown-50")}
      >
        <Star className={cn("h-4 w-4", starredOnly && "fill-current text-warning-500")}/>
      </Button>

      {showHrOnlyFilter && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Show HR-only documents"
          aria-pressed={hrOnly}
          title="Show HR-only documents"
          onClick={() => onHrOnlyChange(!hrOnly)}
          className={cn(hrOnly && "border-brown-300 bg-brown-50")}
        >
          <EyeOff className={cn("h-4 w-4", hrOnly && "text-brown-700")}/>
        </Button>
      )}

      {canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-auto bg-brown-600 text-white hover:bg-brown-700">
              <Plus className="mr-2 h-4 w-4"/>
              Add
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onCreateFolder} className="cursor-pointer">
              <FolderPlus className="mr-2 h-4 w-4"/>
              Add Folder
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onUploadFromLocal} className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4"/>
              Upload documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
