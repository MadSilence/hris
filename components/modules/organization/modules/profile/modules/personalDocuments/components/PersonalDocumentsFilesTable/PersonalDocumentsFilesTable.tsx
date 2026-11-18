"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown02Icon, ArrowUp02Icon, Delete02Icon, Download01Icon, FolderTransferIcon, PencilEdit02Icon, SignatureIcon, SquareLock02Icon, StarIcon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { TagChip } from "@/components/ui/TagChip";
import { Checkbox } from "@/components/desact/checkbox";
import { cn } from "@/lib/cn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/desact/table";
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/desact/dropdown-menu";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { DocumentDTO, DocumentVisibility } from "@/api/modules/documents/dto";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { SigningPill } from "@/components/modules/signing/components/SigningPanel";
import { ExpiryCell } from "@/components/modules/signing/components/ExpiryPieces";
import type {
  DocumentSort,
  DocumentSortField,
} from "../../hooks/document/usePersonalDocuments/usePersonalDocuments";
import { formatBytes } from "../../utils/formatBytes";
import { useDateFormatter } from "@/lib/date";
import { getDocumentFileIcon } from "../../utils/getDocumentFileIcon";
import { isPreviewable } from "../../utils/isPreviewable";

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
  /**
   * All documents (documents-expiry F4): the rows grouped under folder headings — files in no folder first, then each
   * folder by name. The map names each folder; absent, the list is not grouped.
   */
  groupByFolder?: { names: Map<string, string>; looseLabel: string };
};

/** The columns the picker may hide, in the table's order. */
export const DOCUMENT_COLUMNS = ["category", "visibility", "expires", "size", "uploaded"] as const;

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

const SortableHead: React.FC<{
  field: DocumentSortField;
  label: string;
  sort: DocumentSort;
  onSortChange: (sort: DocumentSort) => void;
}> = ({ field, label, sort, onSortChange }) => {
  const active = sort.field === field;

  return (
    <TableHead>
      <button
        type="button"
        className="group/sort inline-flex items-center gap-1 hover:text-primary"
        onClick={() =>
          onSortChange({
            field,
            dir: active && sort.dir === "asc" ? "desc" : "asc",
          })
        }
      >
        {label}
        {/* T19–T21: the arrow shows on the sorted column, and on hover on the others. */}
        <Icon
          icon={active && sort.dir === "desc" ? ArrowDown02Icon : ArrowUp02Icon}
          size="sm"
          className={cn(!active && "opacity-0 group-hover/sort:opacity-60")}
        />
      </button>
    </TableHead>
  );
};

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
  getDownloadUrl,
  signingOf,
  onSendForSignature,
  onOpenSigning,
  onRequestNew,
  onEditExpiry,
  hiddenColumns = [],
  columnPicker,
  showVisibility = true,
  groupByFolder,
}) => {
  const shows = (key: (typeof DOCUMENT_COLUMNS)[number]) =>
    !hiddenColumns.includes(key) && (key !== "visibility" || showVisibility);
  const tSigning = useTranslations("signing");
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");

  if (!documents.length) return null;

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectedIds && (
                <TableHead className="w-9">
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
              <SortableHead field="name" label={tCommon("fields.name")} sort={sort} onSortChange={onSortChange}/>
              {shows("category") && <SortableHead field="category" label={t("documents.table.category")} sort={sort} onSortChange={onSortChange}/>}
              {shows("visibility") && <SortableHead field="visibility" label={t("documents.table.whoCanSee")} sort={sort} onSortChange={onSortChange}/>}
              {shows("expires") && <SortableHead field="expiresOn" label={tSigning("expiry.expires")} sort={sort} onSortChange={onSortChange}/>}
              {shows("size") && <SortableHead field="size" label={t("documents.table.size")} sort={sort} onSortChange={onSortChange}/>}
              {shows("uploaded") && (
                <SortableHead
                  field="createdAt"
                  label={t("documents.table.uploaded")}
                  sort={sort}
                  onSortChange={onSortChange}
                />
              )}
              <TableHead className="w-[120px] text-right">{columnPicker}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {grouped(documents, groupByFolder).map(({ document, heading }) => (
              <React.Fragment key={document.id}>
              {heading !== null && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={99} className="pt-4 text-label font-medium text-secondary">{heading}</TableCell>
                </TableRow>
              )}
              <TableRow
                // Double click, or Enter on the focused row, opens the preview (design fixes of 2026-11-04, fix 8).
                tabIndex={0}
                data-state={selectedIds?.has(document.id) ? "selected" : undefined}
                className={cn(
                  "group/row h-12 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                  selectedIds?.has(document.id) && "bg-accent-subtle",
                )}
                onDoubleClick={() => {
                  if (onPreview && isPreviewable(document.mimeType)) onPreview(document);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.target === event.currentTarget && onPreview && isPreviewable(document.mimeType)) {
                    // The preview takes focus onto its Close button; left alone, this same Enter then clicks it and the
                    // preview shuts the moment it opens (walk of 2026-11-06).
                    event.preventDefault();
                    onPreview(document);
                  }
                }}
              >
                {selectedIds && (
                  <TableCell className="w-9" onDoubleClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      aria-label={t("documents.table.select", { name: document.name })}
                      checked={selectedIds.has(document.id)}
                      onCheckedChange={() => onToggleSelected?.(document.id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-tertiary [&_svg]:h-5 [&_svg]:w-5">
                      {getDocumentFileIcon(document.mimeType)}
                    </span>
                    <span className="truncate font-medium">{document.name}</span>
                    {document.isStarred && (
                      <Icon icon={StarIcon} size="sm" className="shrink-0 fill-current text-status-pending-icon" />
                    )}
                    {/* A signed copy carries the mark (S06); a file out for signature, its pill (S06, S08). */}
                    {document.signedAt && <Icon icon={SignatureIcon} size="sm" className="shrink-0 text-status-approved-text" />}
                    {signingOf?.(document) && !document.signedAt && <SigningPill envelope={signingOf(document)!} />}
                  </div>
                </TableCell>

                {shows("category") && (
                  <TableCell>{document.categoryName ? <TagChip color={null} size="sm">{document.categoryName}</TagChip> : null}</TableCell>
                )}

                {shows("visibility") && (
                  <TableCell>
                    {/* Who can see it (documents-tab): "Visible" with an eye, "Hidden" with a crossed eye. */}
                    <span className="inline-flex items-center gap-1.5 text-secondary">
                      <Icon
                        icon={document.visibility === "HR_ONLY" ? ViewOffSlashIcon : ViewIcon}
                        size="sm"
                        className="size-3.5 text-tertiary"
                      />
                      {document.visibility === "HR_ONLY" ? t("documents.table.hidden") : t("documents.table.visible")}
                    </span>
                  </TableCell>
                )}

                {shows("expires") && <TableCell><ExpiryCell document={document} /></TableCell>}
                {shows("size") && <TableCell className="tabular-nums">{formatBytes(document.sizeBytes)}</TableCell>}

                {shows("uploaded") && (
                  <TableCell className="tabular-nums">{formatDisplayDate(document.createdAt, { style: "medium" })}</TableCell>
                )}

                {/* Quick actions on hover (documents-tab): Download, Star, then the menu, always reachable by keyboard. */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                  <a
                    href={getDownloadUrl(document.id)}
                    download
                    aria-label={tCommon("actions.download")}
                    title={tCommon("actions.download")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-control text-tertiary opacity-0 hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100"
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
                      "inline-flex h-8 w-8 items-center justify-center rounded-control hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100",
                      !document.isStarred && "opacity-0",
                    )}
                  >
                    <Icon
                      icon={StarIcon}
                      size="sm"
                      className={`${
                        document.isStarred
                          ? "fill-current text-status-pending-icon"
                          : "text-tertiary"
                      }`}
                    />
                  </button>
                  <RowActionsMenu label={t("documents.table.actions")}>
                    {/* Download, Rename, Move, Change visibility, — Delete (D1, D3). Preview opens on a double
                        click or Enter on the row, not from here. */}
                    {/*
                      The one menu item that is a link rather than a handler: the download is a
                      browser navigation, which carries the session cookie by itself.
                    */}
                    <DropdownMenuItem asChild className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer">
                      <a href={getDownloadUrl(document.id)} download>
                        <Icon icon={Download01Icon} size="sm" className="text-tertiary" />
                        {tCommon("actions.download")}
                      </a>
                    </DropdownMenuItem>

                    {/* No star here: the row's own star button does it, one click away. */}
                    {/* Signing (S01, S10–S12): Send for a PDF not out and not signed; the Signing panel when there is one. */}
                    {onSendForSignature && document.mimeType === "application/pdf" && !document.signedAt
                      && signingOf?.(document)?.status !== "SENT" ? (
                      <RowAction icon={<Icon icon={SignatureIcon} size="sm" />} onClick={() => onSendForSignature(document)}>
                        {tSigning("menu.send")}
                      </RowAction>
                    ) : null}
                    {onOpenSigning && signingOf?.(document) ? (
                      <RowAction icon={<Icon icon={SignatureIcon} size="sm" />} onClick={() => onOpenSigning(document)}>
                        {tSigning("menu.open")}
                      </RowAction>
                    ) : null}
                    {onEditExpiry && !document.signedAt ? (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onEditExpiry(document)}>
                        {tSigning("expiry.edit")}
                      </RowAction>
                    ) : null}
                    {onRequestNew && (document.expiryState === "EXPIRING" || document.expiryState === "EXPIRED") ? (
                      <RowAction icon={<Icon icon={Download01Icon} size="sm" className="rotate-180" />} onClick={() => onRequestNew(document)}>
                        {tSigning("requests.newOne")}
                      </RowAction>
                    ) : null}
                    {onRename && !document.signedAt && signingOf?.(document)?.status !== "SENT" ? (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(document)}>
                        {tCommon("actions.rename")}
                      </RowAction>
                    ) : null}
                    {onMove ? (
                      <RowAction icon={<Icon icon={FolderTransferIcon} size="sm" />} onClick={() => onMove(document)}>
                        {t("documents.table.move")}
                      </RowAction>
                    ) : null}
                    {onChangeVisibility ? (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2.5 rounded-control px-2.5 py-1.5">
                          <Icon icon={SquareLock02Icon} size="sm" className="text-tertiary" />
                          {t("documents.table.whoCanSee")}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={document.visibility}
                            onValueChange={(next) => onChangeVisibility(document, next as DocumentVisibility)}
                          >
                            <DropdownMenuRadioItem value="VISIBLE_TO_EMPLOYEE">{t("documents.table.visible")}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="HR_ONLY">{t("documents.table.hidden")}</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ) : null}
                    {onDelete ? (
                      <RowActionDestructive
                        icon={<Icon icon={Delete02Icon} size="sm" />}
                        onClick={() => onDelete(document)}
                      >
                        {t("documents.table.moveToTrash")}
                      </RowActionDestructive>
                    ) : null}
                  </RowActionsMenu>
                  </div>
                </TableCell>
              </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
