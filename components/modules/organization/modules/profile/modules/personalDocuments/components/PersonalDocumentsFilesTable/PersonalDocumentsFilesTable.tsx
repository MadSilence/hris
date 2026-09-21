import * as React from "react";
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, FolderInput, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { DropdownMenuItem } from "@/public/desact/src/components/ui/dropdown-menu";
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
        className="inline-flex items-center gap-1 hover:text-foreground"
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
            <ArrowUp className="h-3 w-3"/>
          ) : (
            <ArrowDown className="h-3 w-3"/>
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
                label="Uploaded At"
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
                    <span className="shrink-0 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
                      {getDocumentFileIcon(document.mimeType)}
                    </span>
                    <span className="font-medium">{document.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {document.categoryName ? (
                    <Badge variant="secondary">{document.categoryName}</Badge>
                  ) : (
                    null
                  )}
                </TableCell>

                <TableCell>
                  {document.visibility === "HR_ONLY" ? (
                    <Badge variant="outline" className="gap-1 font-normal">
                      <EyeOff className="h-3 w-3"/>
                      HR only
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Visible</span>
                  )}
                </TableCell>

                <TableCell>{formatBytes(document.sizeBytes)}</TableCell>

                <TableCell>{formatDisplayDate(document.createdAt)}</TableCell>

                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggleStar(document)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        document.isStarred
                          ? "fill-current text-warning-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </TableCell>

                <TableCell className="text-center">
                  <RowActionsMenu label="Document Actions">
                    {onPreview && isPreviewable(document.mimeType) ? (
                      <RowAction icon={<Eye className="h-4 w-4"/>} onClick={() => onPreview(document)}>
                        Preview
                      </RowAction>
                    ) : null}

                    {/*
                      The one menu item that is a link rather than a handler: the download is a
                      browser navigation, which carries the session cookie by itself.
                    */}
                    <DropdownMenuItem asChild className="gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer">
                      <a href={getDownloadUrl(document.id)} download>
                        <Download className="h-4 w-4 text-muted-foreground"/>
                        Download
                      </a>
                    </DropdownMenuItem>

                    <RowAction
                      icon={document.isStarred ? <StarOff className="h-4 w-4"/> : <Star className="h-4 w-4"/>}
                      onClick={() => onToggleStar(document)}
                    >
                      {document.isStarred ? "Remove Star" : "Add Star"}
                    </RowAction>

                    {onRename ? (
                      <RowAction icon={<Pencil className="h-4 w-4"/>} onClick={() => onRename(document)}>
                        Rename
                      </RowAction>
                    ) : null}
                    {onMove ? (
                      <RowAction icon={<FolderInput className="h-4 w-4"/>} onClick={() => onMove(document)}>
                        Move
                      </RowAction>
                    ) : null}
                    {onDelete ? (
                      <RowActionDestructive
                        icon={<Trash2 className="h-4 w-4"/>}
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
