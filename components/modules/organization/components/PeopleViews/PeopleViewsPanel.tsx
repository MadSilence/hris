"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import type { PeopleView } from "@/models/peopleView";

export type PeopleViewsPanelProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;

  views: PeopleView[];
  isLoading: boolean;

  activeViewId: string | null;
  isShared: boolean;
  dirty: boolean;
  busy?: boolean;

  onApplyDefault: () => void;
  onApplyView: (view: PeopleView) => void;
  onSaveAs: (name: string) => void;
  onUpdateActive: () => void;
  onRename: (view: PeopleView, name: string) => void;
  onDuplicate: (view: PeopleView) => void;
  onDelete: (view: PeopleView) => void;
  onShare: () => void;
};

type NameDialogState =
  | { kind: "saveAs" }
  | { kind: "rename"; view: PeopleView }
  | null;

export default function PeopleViewsPanel({
  collapsed,
  onToggleCollapsed,
  views,
  isLoading,
  activeViewId,
  isShared,
  dirty,
  busy,
  onApplyDefault,
  onApplyView,
  onSaveAs,
  onUpdateActive,
  onRename,
  onDuplicate,
  onDelete,
  onShare,
}: PeopleViewsPanelProps) {
  const [dialog, setDialog] = useState<NameDialogState>(null);
  const [name, setName] = useState("");

  const openSaveAs = () => {
    setName("");
    setDialog({ kind: "saveAs" });
  };
  const openRename = (view: PeopleView) => {
    setName(view.name);
    setDialog({ kind: "rename", view });
  };
  const submitDialog = () => {
    const trimmed = name.trim();
    if (!trimmed || !dialog) return;
    if (dialog.kind === "saveAs") onSaveAs(trimmed);
    else onRename(dialog.view, trimmed);
    setDialog(null);
  };

  if (collapsed) {
    return (
      <div className="flex flex-none flex-col items-center gap-2 border-l border-brown-200 pl-2 pt-1">
        <Button variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Expand views panel">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Bookmark className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-none flex-col gap-3 border-l border-brown-200 pl-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Saved views</span>
        <Button variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Collapse views panel">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isShared ? (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
          <Share2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Shared view (not saved)</span>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        <ViewRow
          label="Default"
          active={activeViewId === null && !isShared}
          onClick={onApplyDefault}
        />

        {isLoading ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">Loading…</div>
        ) : (
          views.map((view) => (
            <ViewRow
              key={view.id}
              label={view.name}
              active={activeViewId === view.id}
              dirty={activeViewId === view.id && dirty}
              onClick={() => onApplyView(view)}
              menu={
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => openRename(view)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(view)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(view)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              }
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-brown-200 pt-3">
        {activeViewId !== null && dirty ? (
          <Button size="sm" variant="outline" onClick={onUpdateActive} disabled={busy} className="justify-start gap-2">
            <Check className="h-4 w-4" />
            Save changes
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={openSaveAs} disabled={busy} className="justify-start gap-2">
          <Plus className="h-4 w-4" />
          Save as new view
        </Button>
        <Button size="sm" variant="ghost" onClick={onShare} disabled={busy} className="justify-start gap-2">
          <Share2 className="h-4 w-4" />
          Copy share link
        </Button>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog?.kind === "rename" ? "Rename view" : "Save view"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDialog()}
            placeholder="View name"
            className="h-9"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={submitDialog} disabled={!name.trim()}>
              {dialog?.kind === "rename" ? "Rename" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ViewRow({
  label,
  active,
  dirty,
  onClick,
  menu,
}: {
  label: string;
  active?: boolean;
  dirty?: boolean;
  onClick: () => void;
  menu?: React.ReactNode;
}) {
  return (
    <div
      className={`group flex items-center gap-1 rounded-md pl-2 pr-1 ${
        active ? "bg-brown-100" : "hover:bg-brown-50"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm text-foreground"
      >
        <span className="truncate">{label}</span>
        {dirty ? (
          <Badge variant="secondary" className="ml-auto h-4 shrink-0 px-1 text-[10px] font-normal">
            edited
          </Badge>
        ) : null}
      </button>

      {menu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`${label} actions`}
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-brown-100 focus:opacity-100 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>
      ) : null}
    </div>
  );
}
