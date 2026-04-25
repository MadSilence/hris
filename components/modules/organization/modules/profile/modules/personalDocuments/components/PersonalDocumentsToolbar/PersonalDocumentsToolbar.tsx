"use client";

import * as React from "react";
import { FolderPlus, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";

type PersonalDocumentsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onUploadFromLocal: () => void;
  onCreateFolder: () => void;
};

export const PersonalDocumentsToolbar: React.FC<PersonalDocumentsToolbarProps> = ({
  search,
  onSearchChange,
  onUploadFromLocal,
  onCreateFolder,
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
            Upload document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
