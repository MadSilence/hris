"use client";

import React, { useState } from "react";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Bookmark01Icon, Copy01Icon, Delete02Icon, Link01Icon, PencilEdit02Icon, Share01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Badge } from "@/components/desact/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { PeopleView } from "@/models/peopleView";
import { ShareViewDialog } from "@/components/modules/organization/components/PeopleViews/ShareViewDialog";
import { NodRing } from "@/components/desact/nod";

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
      <div className="flex flex-none flex-col items-center gap-2 border-l border-divider pl-2 pt-1">
        <Button type="button" variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Expand views panel">
          <Icon icon={ArrowLeft01Icon} size="sm" />
        </Button>
        <Icon icon={Bookmark01Icon} size="sm" className="text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-none flex-col gap-3 border-l border-divider pl-3">
      <div className="flex items-center justify-between">
        <span className="text-body font-semibold text-primary">Saved views</span>
        <Button type="button" variant="ghost" size="icon" onClick={onToggleCollapsed} aria-label="Collapse views panel">
          <Icon icon={ArrowRight01Icon} size="sm" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <section className="flex flex-col gap-0.5" aria-label="My views">
          <SectionLabel>My views</SectionLabel>
          <ViewRow label="Default" active={activeViewId === null} onClick={onApplyDefault} />

          {isLoading ? (
            <div className="flex justify-center px-2 py-2"><NodRing size="sm" /></div>
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
                    <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => openRename(view)}>
                      Rename
                    </RowAction>
                    <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={() => onDuplicate(view)}>
                      Duplicate
                    </RowAction>
                    <RowAction icon={<Icon icon={Share01Icon} size="sm" />} onClick={() => setSharing(view)}>
                      Share
                    </RowAction>
                    <RowActionDestructive
                      icon={<Icon icon={Delete02Icon} size="sm" />}
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
          <section className="flex flex-col gap-0.5" aria-label="Shared with me">
            <SectionLabel>Shared with me</SectionLabel>
            {sharedViews.map((view) => (
              <ViewRow
                key={view.id}
                label={view.name}
                detail={`${view.ownerName ?? "Someone"} · ${view.access === "EDIT" ? "Can edit" : "Can view"}`}
                active={activeViewId === view.id}
                dirty={activeViewId === view.id && dirty}
                onClick={() => onApplyView(view)}
                menu={
                  <RowActionsMenu label={`${view.name} Actions`}>
                    <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={() => onDuplicate(view)}>
                      Save a copy
                    </RowAction>
                  </RowActionsMenu>
                }
              />
            ))}
          </section>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-divider pt-3">
        {activeView !== null && dirty && canSaveActive ? (
          <Button type="button" size="sm" variant="secondary" onClick={onUpdateActive} disabled={busy} className="justify-start gap-2">
            <Icon icon={Tick02Icon} size="sm" />
            Save changes
          </Button>
        ) : null}
        {activeView !== null && !canSaveActive ? (
          <Button type="button" size="sm" variant="secondary" onClick={onSaveActiveCopy} disabled={busy} className="justify-start gap-2">
            <Icon icon={Copy01Icon} size="sm" />
            Save a copy
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="secondary" onClick={openSaveAs} disabled={busy} className="justify-start gap-2">
          <Icon icon={Add01Icon} size="sm" />
          Save as new view
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCopyLink} className="justify-start gap-2">
          <Icon icon={Link01Icon} size="sm" />
          Copy link
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
  return <span className="px-2 pb-1 text-hint font-medium text-tertiary">{children}</span>;
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
      className={`group flex items-center gap-1 rounded-control pl-2 pr-1 ${
        active ? "bg-accent-muted text-accent-text" : "hover:bg-subtle"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-body text-primary"
      >
        <span className="min-w-0">
          <span className="block truncate">{label}</span>
          {detail ? <span className="block truncate text-hint text-tertiary">{detail}</span> : null}
        </span>
        {dirty ? (
          <Badge variant="neutral" className="ml-auto h-4 shrink-0 px-1 text-hint font-normal">
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
