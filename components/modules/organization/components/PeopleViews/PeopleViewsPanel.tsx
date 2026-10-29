"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
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
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { PeopleView } from "@/models/peopleView";
import { ShareViewDialog } from "@/components/modules/organization/components/PeopleViews/ShareViewDialog";

export type PeopleViewsPanelProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;

  /** The caller's own views and the ones shared with them — `access` tells them apart. */
  views: PeopleView[];
  isLoading: boolean;

  activeViewId: string | null;
  dirty: boolean;
  busy?: boolean;

  onApplyDefault: () => void;
  onApplyView: (view: PeopleView) => void;
  onSaveAs: (name: string) => void;
  onUpdateActive: () => void;
  onRename: (view: PeopleView, name: string) => void;
  onDuplicate: (view: PeopleView) => void;
  onDelete: (view: PeopleView) => void;
  /** Copies the page's address — the table's state is in it, so the link opens what is on screen. */
  onCopyLink: () => void;
  /** Save a Copy of the open view when it is shared to view only. */
  onSaveActiveCopy: () => void;
};

type NameDialogState =
  | { kind: "saveAs" }
  | { kind: "rename"; view: PeopleView }
  | null;

const isOwn = (view: PeopleView) => (view.access ?? "OWNER") === "OWNER";

export default function PeopleViewsPanel({
  collapsed,
  onToggleCollapsed,
  views,
  isLoading,
  activeViewId,
  dirty,
  busy,
  onApplyDefault,
  onApplyView,
  onSaveAs,
  onUpdateActive,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink,
  onSaveActiveCopy,
}: PeopleViewsPanelProps) {
  const [dialog, setDialog] = useState<NameDialogState>(null);
  const [name, setName] = useState("");
  const [sharing, setSharing] = useState<PeopleView | null>(null);

  const ownViews = views.filter(isOwn);
  const sharedViews = views.filter((v) => !isOwn(v));
  const activeView = views.find((v) => v.id === activeViewId) ?? null;
  // A view shared to view only is read, not saved over: the way to keep a change is a copy.
  const canSaveActive = activeView !== null && activeView.access !== "VIEW";

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
        <Button type="button" variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Expand views panel">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Bookmark className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-none flex-col gap-3 border-l border-brown-200 pl-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Saved Views</span>
        <Button type="button" variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Collapse views panel">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <section className="flex flex-col gap-0.5" aria-label="My Views">
          <SectionLabel>My Views</SectionLabel>
          <ViewRow label="Default" active={activeViewId === null} onClick={onApplyDefault} />

          {isLoading ? (
            <div className="px-2 py-2 text-xs text-muted-foreground">Loading…</div>
          ) : (
            ownViews.map((view) => (
              <ViewRow
                key={view.id}
                label={view.name}
                active={activeViewId === view.id}
                dirty={activeViewId === view.id && dirty}
                onClick={() => onApplyView(view)}
                menu={
                  <RowActionsMenu label={`${view.name} Actions`}>
                    <RowAction icon={<Pencil className="h-4 w-4" />} onClick={() => openRename(view)}>
                      Rename
                    </RowAction>
                    <RowAction icon={<Copy className="h-4 w-4" />} onClick={() => onDuplicate(view)}>
                      Duplicate
                    </RowAction>
                    <RowAction icon={<Share2 className="h-4 w-4" />} onClick={() => setSharing(view)}>
                      Share
                    </RowAction>
                    <RowActionDestructive
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => onDelete(view)}
                    >
                      Delete
                    </RowActionDestructive>
                  </RowActionsMenu>
                }
              />
            ))
          )}
        </section>

        {sharedViews.length ? (
          <section className="flex flex-col gap-0.5" aria-label="Shared With Me">
            <SectionLabel>Shared With Me</SectionLabel>
            {sharedViews.map((view) => (
              <ViewRow
                key={view.id}
                label={view.name}
                detail={`${view.ownerName ?? "Someone"} · ${view.access === "EDIT" ? "Can Edit" : "Can View"}`}
                active={activeViewId === view.id}
                dirty={activeViewId === view.id && dirty}
                onClick={() => onApplyView(view)}
                menu={
                  <RowActionsMenu label={`${view.name} Actions`}>
                    <RowAction icon={<Copy className="h-4 w-4" />} onClick={() => onDuplicate(view)}>
                      Save a Copy
                    </RowAction>
                  </RowActionsMenu>
                }
              />
            ))}
          </section>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-brown-200 pt-3">
        {activeView !== null && dirty && canSaveActive ? (
          <Button type="button" size="sm" variant="outline" onClick={onUpdateActive} disabled={busy} className="justify-start gap-2">
            <Check className="h-4 w-4" />
            Save Changes
          </Button>
        ) : null}
        {activeView !== null && !canSaveActive ? (
          <Button type="button" size="sm" variant="outline" onClick={onSaveActiveCopy} disabled={busy} className="justify-start gap-2">
            <Copy className="h-4 w-4" />
            Save a Copy
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={openSaveAs} disabled={busy} className="justify-start gap-2">
          <Plus className="h-4 w-4" />
          Save as New View
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCopyLink} className="justify-start gap-2">
          <Link2 className="h-4 w-4" />
          Copy Link
        </Button>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog?.kind === "rename" ? "Rename View" : "Save View"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDialog()}
            className="h-9"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitDialog} disabled={!name.trim()}>
              {dialog?.kind === "rename" ? "Rename" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareViewDialog view={sharing} onClose={() => setSharing(null)} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="px-2 pb-1 text-xs font-medium text-muted-foreground">{children}</span>;
}

function ViewRow({
  label,
  detail,
  active,
  dirty,
  onClick,
  menu,
}: {
  label: string;
  /** A quiet second line — whose view it is and what the reader may do with it. */
  detail?: string;
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
        <span className="min-w-0">
          <span className="block truncate">{label}</span>
          {detail ? <span className="block truncate text-[11px] text-muted-foreground">{detail}</span> : null}
        </span>
        {dirty ? (
          <Badge variant="secondary" className="ml-auto h-4 shrink-0 px-1 text-[10px] font-normal">
            edited
          </Badge>
        ) : null}
      </button>

      {/*
        The trigger came with the row and was `opacity-0` until hover, which makes it unreachable on
        touch. `RowActionsMenu` brings its own always-visible trigger.
      */}
      {menu ?? null}
    </div>
  );
}
