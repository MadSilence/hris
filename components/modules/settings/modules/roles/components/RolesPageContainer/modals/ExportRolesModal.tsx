"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export interface ExportRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onRequestClose: () => void;
  onExport: (values: { format: "csv" | "xlsx" }) => void;
}

export default function ExportRolesModal({
  isOpen,
  isLoading = false,
  onRequestClose,
  onExport,
}: ExportRolesModalProps) {
  const [format, setFormat] = React.useState<"csv" | "xlsx">("xlsx");

  React.useEffect(() => {
    if (!isOpen) return;
    setFormat("xlsx");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-xl p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-brown-600"/>
            Export roles
          </DialogTitle>
          <DialogDescription>
            Export all roles with permissions and assigned users.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="text-sm font-medium">Format</div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("csv")}
              disabled={isLoading}
              className={[
                "rounded-lg border p-4 text-left transition",
                format === "csv" ? "border-brown-600 bg-brown-50" : "border-brown-200 hover:bg-brown-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brown-600"/>
                <div className="font-medium">CSV</div>
                <Badge variant="secondary" className="ml-auto">
                  Lightweight
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Best for simple imports and quick viewing.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat("xlsx")}
              disabled={isLoading}
              className={[
                "rounded-lg border p-4 text-left transition",
                format === "xlsx" ? "border-brown-600 bg-brown-50" : "border-brown-200 hover:bg-brown-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brown-600"/>
                <div className="font-medium">XLSX</div>
                <Badge variant="secondary" className="ml-auto">
                  Recommended
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Better for structured data and multiple sheets.
              </div>
            </button>
          </div>

          <div className="rounded-md bg-brown-50 px-4 py-3 text-xs text-muted-foreground">
            Included: role name, status, system flag, permissions, assigned users.
          </div>
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={isLoading}
            className="bg-brown-600 text-white hover:bg-brown-700"
            onClick={() => onExport({ format })}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
