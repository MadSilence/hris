"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Delete02Icon,
  Download01Icon,
  FileImportIcon,
  Folder01Icon,
  FolderTransferIcon,
  HourglassIcon,
  PencilEdit02Icon,
  SignatureIcon,
  SquareLock02Icon,
  StarIcon,
  Tick02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { TagChip } from "@/components/ui/TagChip";
import { Checkbox } from "@/components/desact/checkbox";
import { cn } from "@/lib/cn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/desact/table";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/desact/dropdown-menu";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { DocumentDTO, DocumentVisibility } from "@/api/modules/documents/dto";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { SigningPill } from "@/components/modules/signing/components/SigningPanel";
import { ExpiryCell } from "@/components/modules/signing/components/ExpiryPieces";
import {
  DocumentName,
  FileTypeTile,
  SortHeader,
  VisibilityCell,
  isRowClick,
} from "@/components/modules/signing/components/DocumentPieces";
import type {
  DocumentSort,
  DocumentSortField,
} from "../../hooks/document/usePersonalDocuments/usePersonalDocuments";
import { formatBytes } from "../../utils/formatBytes";
import { useDateFormatter } from "@/lib/date";

type PersonalDocumentsFilesTableProps = {
  documents: DocumentDTO[];
  sort: DocumentSort;
  onSortChange: (sort: DocumentSort) => void;
  onToggleStar: (document: DocumentDTO) => Promise<void> | void;
  /** Handlers take the whole document — the confirm dialogs need its name, not just an id. */
  onDelete?: (document: DocumentDTO) => void;
  onMove?: (document: DocumentDTO) => void;
  onRename?: (document: DocumentDTO) => void;
  onPreview?: (document: DocumentDTO) => void;
  /** Bulk selection (D2): the ids picked, and how to toggle one or all. Absent, the table has no checkboxes. */
  selectedIds?: Set<string>;
  onToggleSelected?: (id: string) => void;
  onToggleAllSelected?: () => void;
  /** Only for those who manage documents (D3): HR only, or the person too. */
  onChangeVisibility?: (document: DocumentDTO, visibility: DocumentVisibility) => void;
  /** The person's first name, for "Hidden from Reza" / "Visible to Reza" (DT11). */
  personFirstName?: string | null;
  getDownloadUrl: (documentId: string) => string;
  /** The latest signing of a file, for its pill and its menu (documents-send-for-signature S06, S10–S12). */
  signingOf?: (document: DocumentDTO) => EnvelopeDTO | undefined;
  /** Only for those who may send a person's documents for signature; a PDF only. */
  onSendForSignature?: (document: DocumentDTO) => void;
  onOpenSigning?: (document: DocumentDTO) => void;
  /** "Request the new one" on a file that is expiring or expired (documents-requests R01). */
  onRequestNew?: (document: DocumentDTO) => void;
  /** Edit expiry date (documents-expiry X03, X04); not on a signed file. */
  onEditExpiry?: (document: DocumentDTO) => void;
  /** Columns this reader hid (T22–T23): "category", "visibility", "expires", "size", "uploaded". The name always stays. */
  hiddenColumns?: string[];
  /** The picker at the end of the header row. */
  columnPicker?: React.ReactNode;
  /** Who can see — not shown to the person on their own tab (T18). */
  showVisibility?: boolean;
  /** Starred (V2-Starred, DT22): a Folder column after the name — the folder's name, or "—". */
  folderNames?: Map<string, string>;
  /**
   * All documents (documents-expiry F4): the rows grouped under folder headings — files in no folder first, then each
   * folder by name. The map names each folder; absent, the list is not grouped.
   */
  groupByFolder?: { names: Map<string, string>; looseLabel: string };
};

/** The columns the picker may hide, in the table's order (T22, DT27): Category · Expires · Who can see · Size · Uploaded. */
export const DOCUMENT_COLUMNS = ["category", "expires", "visibility", "size", "uploaded"] as const;

/** Size is off until somebody turns it on (DT10). */
export const DOCUMENT_COLUMNS_HIDDEN_BY_DEFAULT = ["size"];

/** Rows in order, each carrying the heading to draw above it when it starts a group (F4). */
const grouped = (
  documents: DocumentDTO[],
  by: PersonalDocumentsFilesTableProps["groupByFolder"],
): { document: DocumentDTO; heading: string | null }[] => {
  if (!by) return documents.map((document) => ({ document, heading: null }));
  const nameOf = (d: DocumentDTO) => (d.folderId ? by.names.get(d.folderId) ?? "" : "");
  // A stable sort keeps the table's own order inside each folder.
  const ordered = [...documents].sort((a, b) => {
    if (!a.folderId !== !b.folderId) return a.folderId ? 1 : -1;
    return nameOf(a).localeCompare(nameOf(b));
  });
  return ordered.map((document, i) => {
    const key = document.folderId ?? "";
    const startsGroup = i === 0 || (ordered[i - 1].folderId ?? "") !== key;
    return { document, heading: startsGroup ? (document.folderId ? nameOf(document) : by.looseLabel) : null };
  });
};

const Head: React.FC<{
  field: DocumentSortField;
  label: string;
  sort: DocumentSort;
  onSortChange: (sort: DocumentSort) => void;
  className?: string;
}> = ({ field, label, sort, onSortChange, className }) => {
  const active = sort.field === field;
  return (
    <TableHead className={className}>
      <SortHeader
        label={label}
        active={active}
        ascending={sort.dir === "asc"}
        onClick={() => onSortChange({ field, dir: active && sort.dir === "asc" ? "desc" : "asc" })}
      />
    </TableHead>
  );
};

/*
 * Column widths from X01-List (DT30): the name takes the rest and cuts with …, so the table fits a 1440 window with no
 * sideways scroll. Each width carries the 16 between columns.
 */
const W = {
  check: "w-8",
  folder: "w-40",
  category: "w-36",
  expires: "w-[184px]",
  visibility: "w-36",
  size: "w-24",
  uploaded: "w-[120px]",
  actions: "w-28",
} as const;

export const PersonalDocumentsFilesTable: React.FC<PersonalDocumentsFilesTableProps> = ({
  documents,
  sort,
  onSortChange,
  onToggleStar,
  onDelete,
  onMove,
  onRename,
  onPreview,
  selectedIds,
  onToggleSelected,
  onToggleAllSelected,
  onChangeVisibility,
  personFirstName,
  getDownloadUrl,
  signingOf,
  onSendForSignature,
  onOpenSigning,
  onRequestNew,
  onEditExpiry,
  hiddenColumns = [],
  columnPicker,
  showVisibility = true,
  folderNames,
  groupByFolder,
}) => {
  const shows = (key: (typeof DOCUMENT_COLUMNS)[number]) =>
    !hiddenColumns.includes(key) && (key !== "visibility" || showVisibility);
  const tSigning = useTranslations("signing");
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");

  if (!documents.length) return null;

  const hiddenLabel = personFirstName ? t("documents.table.hiddenFrom", { name: personFirstName }) : t("documents.table.hidden");
  const visibleLabel = personFirstName ? t("documents.table.visibleTo", { name: personFirstName }) : t("documents.table.visible");

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {selectedIds && (
            <TableHead className={W.check}>
              <Checkbox
                aria-label={t("documents.table.selectAll")}
                checked={
                  documents.length > 0 && documents.every((d) => selectedIds.has(d.id))
                    ? true
                    : documents.some((d) => selectedIds.has(d.id))
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={() => onToggleAllSelected?.()}
              />
            </TableHead>
          )}
          <Head field="name" label={tCommon("fields.name")} sort={sort} onSortChange={onSortChange}/>
          {folderNames && <TableHead className={W.folder}>{t("documents.table.folder")}</TableHead>}
          {shows("category") && <Head className={W.category} field="category" label={t("documents.table.category")} sort={sort} onSortChange={onSortChange}/>}
          {shows("expires") && <Head className={W.expires} field="expiresOn" label={tSigning("expiry.expires")} sort={sort} onSortChange={onSortChange}/>}
          {shows("visibility") && <Head className={W.visibility} field="visibility" label={t("documents.table.whoCanSee")} sort={sort} onSortChange={onSortChange}/>}
          {shows("size") && <Head className={W.size} field="size" label={t("documents.table.size")} sort={sort} onSortChange={onSortChange}/>}
          {shows("uploaded") && <Head className={W.uploaded} field="createdAt" label={t("documents.table.uploaded")} sort={sort} onSortChange={onSortChange}/>}
          <TableHead className={cn(W.actions, "text-right")}>{columnPicker}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {grouped(documents, groupByFolder).map(({ document, heading }) => {
          const signing = signingOf?.(document);
          const out = signing?.status === "SENT";
          return (
          <React.Fragment key={document.id}>
          {heading !== null && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={99} className="pt-4 text-label font-medium text-secondary">{heading}</TableCell>
            </TableRow>
          )}
          <TableRow
            // One click opens the preview, Enter on the focused row too (the owner's A11, 2026-11-20 — the double click
            // of 2026-11-04 is gone); the checkbox, the quick actions and the menu keep their own clicks.
            tabIndex={0}
            data-state={selectedIds?.has(document.id) ? "selected" : undefined}
            className={cn(
              "group/row h-12 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
              selectedIds?.has(document.id) && "bg-accent-subtle",
            )}
            onClick={(event) => {
              if (onPreview && isRowClick(event)) onPreview(document);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.target === event.currentTarget && onPreview) {
                // The preview takes focus onto its Close button; left alone, this same Enter then clicks it and the
                // preview shuts the moment it opens (walk of 2026-11-06).
                event.preventDefault();
                onPreview(document);
              }
            }}
          >
            {selectedIds && (
              <TableCell className={W.check} data-row-control>
                <Checkbox
                  aria-label={t("documents.table.select", { name: document.name })}
                  checked={selectedIds.has(document.id)}
                  onCheckedChange={() => onToggleSelected?.(document.id)}
                />
              </TableCell>
            )}
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <FileTypeTile mimeType={document.mimeType} name={document.name} />
                <DocumentName name={document.name} />
                {/* A signed copy carries the green mark (S06, D01); a file out for signature, its pill (S06, S08). */}
                {document.signedAt && <Icon icon={SignatureIcon} size="sm" className="size-3.5 shrink-0 text-status-approved-icon" />}
                {signing && !document.signedAt && <SigningPill envelope={signing} />}
              </div>
            </TableCell>

            {folderNames && (
              <TableCell className="text-body text-secondary">
                {document.folderId && folderNames.get(document.folderId) ? (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Icon icon={Folder01Icon} size="sm" className="text-tertiary" />
                    <span className="truncate">{folderNames.get(document.folderId)}</span>
                  </span>
                ) : (
                  <span className="text-tertiary">—</span>
                )}
              </TableCell>
            )}

            {shows("category") && (
              <TableCell>
                {document.categoryName
                  ? <TagChip color={null} size="sm">{document.categoryName}</TagChip>
                  : <span className="text-tertiary">—</span>}
              </TableCell>
            )}

            {shows("expires") && <TableCell><ExpiryCell document={document} /></TableCell>}

            {shows("visibility") && (
              <TableCell>
                <VisibilityCell
                  hidden={document.visibility === "HR_ONLY"}
                  label={document.visibility === "HR_ONLY" ? t("documents.table.hidden") : t("documents.table.visible")}
                />
              </TableCell>
            )}

            {shows("size") && <TableCell className="tabular-nums text-tertiary">{formatBytes(document.sizeBytes)}</TableCell>}

            {shows("uploaded") && (
              <TableCell className="tabular-nums text-tertiary">{formatDisplayDate(document.createdAt, { style: "medium" })}</TableCell>
            )}

            {/* Quick actions on hover (V2-List): Download, Star, then the menu, always reachable by keyboard. */}
            <TableCell className="text-right" data-row-control>
              <div className="flex items-center justify-end gap-0.5">
              <a
                href={getDownloadUrl(document.id)}
                download
                aria-label={tCommon("actions.download")}
                title={tCommon("actions.download")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-secondary opacity-0 hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100 touch:opacity-100"
              >
                <Icon icon={Download01Icon} size="sm" />
              </a>
              <button
                type="button"
                onClick={() => onToggleStar(document)}
                aria-label={document.isStarred ? t("documents.table.unstar") : t("documents.table.star")}
                aria-pressed={document.isStarred}
                title={document.isStarred ? t("documents.table.unstar") : t("documents.table.star")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-control hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100 touch:opacity-100",
                  !document.isStarred && "opacity-0",
                )}
              >
                <Icon
                  icon={StarIcon}
                  size="sm"
                  className={document.isStarred ? "fill-current text-status-pending-icon" : "text-secondary"}
                />
              </button>
              {/* Each item below has its own condition; the ⋯ is drawn only when one of them can show. */}
              {(onRename && !document.signedAt && !out) ||
              (onEditExpiry && !document.signedAt) ||
              (onSendForSignature && document.mimeType === "application/pdf" && !document.signedAt && !out) ||
              (onOpenSigning && signing) ||
              (onRequestNew && (document.expiryState === "EXPIRING" || document.expiryState === "EXPIRED")) ||
              onMove ||
              onChangeVisibility ||
              onDelete ? (
              <RowActionsMenu label={t("documents.table.actions")} className="min-w-[230px]" stopPropagation>
                {/*
                  S01-Menu: Rename · Edit expiry date · Send for signature · Move to… · Who can see › · — Move to trash.
                  Download is the row's hover action, always visible on touch, and is not copied in here (U11).
                */}
                {onRename && !document.signedAt && !out ? (
                  <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(document)}>
                    {tCommon("actions.rename")}
                  </RowAction>
                ) : null}
                {onEditExpiry && !document.signedAt ? (
                  <RowAction icon={<Icon icon={HourglassIcon} size="sm" />} onClick={() => onEditExpiry(document)}>
                    {tSigning("expiry.edit")}
                  </RowAction>
                ) : null}
                {/* Signing (S01, S10–S12): Send for a PDF not out and not signed; the Signing panel when there is one. */}
                {onSendForSignature && document.mimeType === "application/pdf" && !document.signedAt && !out ? (
                  <RowAction icon={<Icon icon={SignatureIcon} size="sm" />} onClick={() => onSendForSignature(document)}>
                    {tSigning("menu.send")}
                  </RowAction>
                ) : null}
                {onOpenSigning && signing ? (
                  <RowAction icon={<Icon icon={SignatureIcon} size="sm" />} onClick={() => onOpenSigning(document)}>
                    {tSigning("menu.open")}
                  </RowAction>
                ) : null}
                {onRequestNew && (document.expiryState === "EXPIRING" || document.expiryState === "EXPIRED") ? (
                  <RowAction icon={<Icon icon={FileImportIcon} size="sm" />} onClick={() => onRequestNew(document)}>
                    {tSigning("requests.newOne")}
                  </RowAction>
                ) : null}
                {onMove ? (
                  <RowAction icon={<Icon icon={FolderTransferIcon} size="sm" />} onClick={() => onMove(document)}>
                    {t("documents.table.moveTo")}
                  </RowAction>
                ) : null}
                {onChangeVisibility ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Icon icon={SquareLock02Icon} size="sm" />
                      {t("documents.table.whoCanSee")}
                    </DropdownMenuSubTrigger>
                    {/* Plain items, not a radio group (DT12: the live pick changed nothing) — each calls the change itself. */}
                    <DropdownMenuSubContent className="min-w-[230px]" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem className="cursor-pointer" onSelect={() => onChangeVisibility(document, "HR_ONLY")}>
                        <Icon icon={ViewOffSlashIcon} size="sm" />
                        <span className="flex-1">{hiddenLabel}</span>
                        {document.visibility === "HR_ONLY" && <Icon icon={Tick02Icon} size="sm" className="text-accent-text" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onSelect={() => onChangeVisibility(document, "VISIBLE_TO_EMPLOYEE")}>
                        <Icon icon={ViewIcon} size="sm" />
                        <span className="flex-1">{visibleLabel}</span>
                        {document.visibility !== "HR_ONLY" && <Icon icon={Tick02Icon} size="sm" className="text-accent-text" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : null}
                {onDelete ? (
                  <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => onDelete(document)}>
                    {t("documents.table.moveToTrash")}
                  </RowActionDestructive>
                ) : null}
              </RowActionsMenu>
              ) : null}
              </div>
            </TableCell>
          </TableRow>
          </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};
