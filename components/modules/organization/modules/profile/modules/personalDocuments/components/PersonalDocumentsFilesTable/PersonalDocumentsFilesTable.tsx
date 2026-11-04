import * as React from "react";
import { ArrowDown02Icon, ArrowUp02Icon, Delete02Icon, Download01Icon, FolderTransferIcon, PencilEdit02Icon, StarIcon, StarOffIcon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
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
import { formatDisplayDate } from "@/lib/date";
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
  if (!documents.length) return null;

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead field="name" label="Name" sort={sort} onSortChange={onSortChange}/>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <SortableHead field="size" label="Size" sort={sort} onSortChange={onSortChange}/>
              <SortableHead
                field="createdAt"
                label="Uploaded at"
                sort={sort}
                onSortChange={onSortChange}
              />
              <TableHead className="w-[44px]"/>
              <TableHead className="w-[44px]"/>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
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
                  {document.visibility === "HR_ONLY" ? (
                    <Badge variant="outline" className="gap-1 font-normal">
                      <Icon icon={ViewOffSlashIcon} size="sm" />
                      HR only
                    </Badge>
                  ) : (
                    <span className="text-tertiary">Visible</span>
                  )}
                </TableCell>

                <TableCell>{formatBytes(document.sizeBytes)}</TableCell>

                <TableCell>{formatDisplayDate(document.createdAt)}</TableCell>

                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggleStar(document)}
                    aria-label={document.isStarred ? "Unstar" : "Star"}
                    aria-pressed={document.isStarred}
                    title={document.isStarred ? "Unstar" : "Star"}
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
                  <RowActionsMenu label="Document actions">
                    {onPreview && isPreviewable(document.mimeType) ? (
                      <RowAction icon={<Icon icon={ViewIcon} size="sm" />} onClick={() => onPreview(document)}>
                        Preview
                      </RowAction>
                    ) : null}

                    {/*
                      The one menu item that is a link rather than a handler: the download is a
                      browser navigation, which carries the session cookie by itself.
                    */}
                    <DropdownMenuItem asChild className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer">
                      <a href={getDownloadUrl(document.id)} download>
                        <Icon icon={Download01Icon} size="sm" className="text-tertiary" />
                        Download
                      </a>
                    </DropdownMenuItem>

                    <RowAction
                      icon={document.isStarred ? <Icon icon={StarOffIcon} size="sm" /> : <Icon icon={StarIcon} size="sm" />}
                      onClick={() => onToggleStar(document)}
                    >
                      {document.isStarred ? "Remove star" : "Add star"}
                    </RowAction>

                    {onRename ? (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(document)}>
                        Rename
                      </RowAction>
                    ) : null}
                    {onMove ? (
                      <RowAction icon={<Icon icon={FolderTransferIcon} size="sm" />} onClick={() => onMove(document)}>
                        Move
                      </RowAction>
                    ) : null}
                    {onDelete ? (
                      <RowActionDestructive
                        icon={<Icon icon={Delete02Icon} size="sm" />}
                        onClick={() => onDelete(document)}
                      >
                        Delete
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
