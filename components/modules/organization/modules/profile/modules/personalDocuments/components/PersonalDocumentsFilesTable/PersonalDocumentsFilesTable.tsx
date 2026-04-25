import * as React from "react";
import { MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import { formatBytes } from "../../utils/formatBytes";
import { formatDocumentDate } from "../../utils/formatDocumentDate";
import { getDocumentFileIcon } from "../../utils/getDocumentFileIcon";

type PersonalDocumentsFilesTableProps = {
  documents: DocumentDTO[];
  onToggleStar: (document: DocumentDTO) => Promise<void> | void;
  onDelete?: (documentId: string) => Promise<void> | void;
  getDownloadUrl: (documentId: string) => string;
};

export const PersonalDocumentsFilesTable: React.FC<PersonalDocumentsFilesTableProps> = ({
  documents,
  onToggleStar,
  onDelete,
  getDownloadUrl,
}) => {
  if (!documents.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Files</h3>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="w-[44px]"/>
              <TableHead className="w-[44px]"/>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {getDocumentFileIcon(document.mimeType)}
                    </span>
                    <span className="font-medium">{document.name}</span>
                  </div>
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
                      <DropdownMenuItem asChild>
                        <a href={getDownloadUrl(document.id)} download>
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStar(document)}>
                        {document.isStarred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      {onDelete ? (
                        <DropdownMenuItem onClick={() => onDelete(document.id)}>
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
