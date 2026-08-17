"use client";

import * as React from "react";
import { FolderPlus, Plus, Search, Star, Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import { cn } from "@/public/desact/src/components/ui/utils";

type PersonalDocumentsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  starredOnly: boolean;
  onStarredOnlyChange: (value: boolean) => void;
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
  onUploadFromLocal,
  onCreateFolder,
  canEdit = true,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[280px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents..."
          className="pl-9"
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Show starred only"
        aria-pressed={starredOnly}
        title="Show starred only"
        onClick={() => onStarredOnlyChange(!starredOnly)}
        className={cn(starredOnly && "border-brown-300 bg-brown-50")}
      >
        <Star className={cn("h-4 w-4", starredOnly && "fill-current text-yellow-500")}/>
      </Button>

      {canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-brown-600 text-white hover:bg-brown-700">
              <Plus className="mr-2 h-4 w-4"/>
              Add
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onCreateFolder} className="cursor-pointer">
              <FolderPlus className="mr-2 h-4 w-4"/>
              Create folder
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
