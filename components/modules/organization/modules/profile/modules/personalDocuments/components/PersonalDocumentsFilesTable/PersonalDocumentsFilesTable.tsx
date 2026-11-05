"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown02Icon, ArrowUp02Icon, Delete02Icon, Download01Icon, FolderTransferIcon, PencilEdit02Icon, SquareLock02Icon, StarIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Badge } from "@/components/desact/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/desact/table";
import { DropdownMenuItem } from "@/components/desact/dropdown-menu";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { DocumentDTO } from "@/api/modules/documents/dto";
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
  getDownloadUrl: (documentId: string) => string;
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
        className="inline-flex items-center gap-1 hover:text-primary"
        onClick={() =>
          onSortChange({
            field,
            dir: active && sort.dir === "asc" ? "desc" : "asc",
          })
        }
      >
        {label}
        {active &&
          (sort.dir === "asc" ? (
            <Icon icon={ArrowUp02Icon} size="sm" />
          ) : (
            <Icon icon={ArrowDown02Icon} size="sm" />
          ))}
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
  getDownloadUrl,
}) => {
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
              <SortableHead field="name" label={tCommon("fields.name")} sort={sort} onSortChange={onSortChange}/>
              <TableHead>{t("documents.table.category")}</TableHead>
              <TableHead>{t("documents.table.visibility")}</TableHead>
              <SortableHead field="size" label={t("documents.table.size")} sort={sort} onSortChange={onSortChange}/>
              <SortableHead
                field="createdAt"
                label={t("documents.table.uploaded")}
                sort={sort}
                onSortChange={onSortChange}
              />
              <TableHead className="w-[44px]"/>
              <TableHead className="w-[44px]"/>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((document) => (
              <TableRow
                key={document.id}
                // Double click, or Enter on the focused row, opens the preview (design fixes of 2026-11-04, fix 8).
                tabIndex={0}
                className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                onDoubleClick={() => {
                  if (onPreview && isPreviewable(document.mimeType)) onPreview(document);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.target === event.currentTarget && onPreview && isPreviewable(document.mimeType)) {
                    onPreview(document);
                  }
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-tertiary [&_svg]:h-5 [&_svg]:w-5">
                      {getDocumentFileIcon(document.mimeType)}
                    </span>
                    <span className="font-medium">{document.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {document.categoryName ? (
                    <Badge variant="neutral">{document.categoryName}</Badge>
                  ) : (
                    null
                  )}
                </TableCell>

                <TableCell>
                  {/* Who can open it: the two values say so in words, not "Visible" against a badge. */}
                  <span className="inline-flex items-center gap-1.5 text-secondary">
                    <Icon
                      icon={document.visibility === "HR_ONLY" ? SquareLock02Icon : ViewIcon}
                      size="sm"
                      className="size-3.5 text-tertiary"
                    />
                    {document.visibility === "HR_ONLY" ? t("documents.table.hrOnly") : t("documents.table.employee")}
                  </span>
                </TableCell>

                <TableCell className="tabular-nums">{formatBytes(document.sizeBytes)}</TableCell>

                <TableCell className="tabular-nums">{formatDisplayDate(document.createdAt, { style: "medium" })}</TableCell>

                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggleStar(document)}
                    aria-label={document.isStarred ? t("documents.table.unstar") : t("documents.table.star")}
                    aria-pressed={document.isStarred}
                    title={document.isStarred ? t("documents.table.unstar") : t("documents.table.star")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-control hover:bg-mist"
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
                </TableCell>

                <TableCell className="text-center">
                  <RowActionsMenu label={t("documents.table.actions")}>
                    {onPreview && isPreviewable(document.mimeType) ? (
                      <RowAction icon={<Icon icon={ViewIcon} size="sm" />} onClick={() => onPreview(document)}>
                        {tCommon("actions.preview")}
                      </RowAction>
                    ) : null}

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
                    {onRename ? (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(document)}>
                        {tCommon("actions.rename")}
                      </RowAction>
                    ) : null}
                    {onMove ? (
                      <RowAction icon={<Icon icon={FolderTransferIcon} size="sm" />} onClick={() => onMove(document)}>
                        {t("documents.table.move")}
                      </RowAction>
                    ) : null}
                    {onDelete ? (
                      <RowActionDestructive
                        icon={<Icon icon={Delete02Icon} size="sm" />}
                        onClick={() => onDelete(document)}
                      >
                        {tCommon("actions.delete")}
                      </RowActionDestructive>
                    ) : null}
                  </RowActionsMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
