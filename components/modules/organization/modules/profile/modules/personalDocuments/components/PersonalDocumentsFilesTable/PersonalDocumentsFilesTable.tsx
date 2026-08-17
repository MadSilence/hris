import * as React from "react";
import { ArrowDown, ArrowUp, MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import type {
  DocumentSort,
  DocumentSortField,
} from "../../hooks/document/usePersonalDocuments/usePersonalDocuments";
import { formatBytes } from "../../utils/formatBytes";
import { formatDocumentDate } from "../../utils/formatDocumentDate";
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
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Files</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead field="name" label="Name" sort={sort} onSortChange={onSortChange}/>
              <TableHead>Category</TableHead>
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
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>{formatBytes(document.sizeBytes)}</TableCell>

                <TableCell>{formatDocumentDate(document.createdAt)}</TableCell>

                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggleStar(document)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        document.isStarred
                          ? "fill-current text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </TableCell>

                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onPreview && isPreviewable(document.mimeType) ? (
                        <DropdownMenuItem onClick={() => onPreview(document)}>
                          Preview
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem asChild>
                        <a href={getDownloadUrl(document.id)} download>
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStar(document)}>
                        {document.isStarred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      {onRename ? (
                        <DropdownMenuItem onClick={() => onRename(document)}>
                          Rename
                        </DropdownMenuItem>
                      ) : null}
                      {onMove ? (
                        <DropdownMenuItem onClick={() => onMove(document)}>
                          Move
                        </DropdownMenuItem>
                      ) : null}
                      {onDelete ? (
                        <DropdownMenuItem onClick={() => onDelete(document)}>
                          Delete
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
