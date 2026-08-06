"use client";

import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Switch } from "@/public/desact/src/components/ui/switch";
import {
  triggerExportDownload,
  type ExportDataFormat,
} from "@/components/modules/settings/shared/ExportDataModal";

type Noun = "department" | "team";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  noun: Noun;
  nodeName: string;
  exportUrl: string;
  directSubNodes: number;
  memberCount: number;
  totalPeople: number;
};

export function ExportOrgTreeModal({
  isOpen, onClose, noun, nodeName, exportUrl, directSubNodes, memberCount, totalPeople,
}: Props) {
  const subLabel = noun === "department" ? "sub-departments" : "sub-teams";

  const [format, setFormat] = useState<ExportDataFormat>("xlsx");
  const [includeSubNodes, setIncludeSubNodes] = useState(false);
  const [includePeople, setIncludePeople] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubNodes = directSubNodes > 0;
  const peopleAvailable = includeSubNodes ? totalPeople > 0 : memberCount > 0;

  useEffect(() => {
    if (isOpen) {
      setFormat("xlsx");
      setIncludeSubNodes(false);
      setIncludePeople(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (includePeople && !peopleAvailable) setIncludePeople(false);
  }, [includePeople, peopleAvailable]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await triggerExportDownload(exportUrl, format, {
        includeSubNodes: String(includeSubNodes),
        includePeople: String(includePeople),
      });
      onClose();
    } catch (e) {
      setError((e as Error)?.message ?? "Export failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export &ldquo;{nodeName}&rdquo;</DialogTitle>
          <DialogDescription>Download this {noun} as a spreadsheet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Format */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Format</div>
            <div className="grid grid-cols-2 gap-3">
              <FormatCard
                active={format === "csv"}
                onClick={() => setFormat("csv")}
                icon={<FileText className="h-4 w-4 text-brown-600" />}
                title="CSV"
                badge="Lightweight"
                hint="Best for simple imports and quick viewing."
              />
              <FormatCard
                active={format === "xlsx"}
                onClick={() => setFormat("xlsx")}
                icon={<FileSpreadsheet className="h-4 w-4 text-brown-600" />}
                title="XLSX"
                badge="Recommended"
                hint="Better for structured data and multiple sheets."
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <OptionRow
              title={`Include all ${subLabel}`}
              hint={
                hasSubNodes
                  ? `Adds every ${noun} below this one to the Structure sheet.`
                  : `This ${noun} has no ${subLabel}.`
              }
              checked={includeSubNodes && hasSubNodes}
              disabled={!hasSubNodes}
              onChange={setIncludeSubNodes}
            />
            <OptionRow
              title="Include assigned people"
              hint={
                peopleAvailable
                  ? "Adds a People sheet with everyone assigned in scope."
                  : "No people assigned in the selected scope."
              }
              checked={includePeople && peopleAvailable}
              disabled={!peopleAvailable}
              onChange={setIncludePeople}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
            className="bg-brown-600 text-white hover:bg-brown-700"
          >
            {isLoading ? "Exporting…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormatCard({
  active, onClick, icon, title, badge, hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  badge: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        active ? "border-brown-600 bg-brown-50" : "border-brown-200 hover:bg-brown-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-medium">{title}</div>
        <Badge variant="secondary" className="ml-auto">{badge}</Badge>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </button>
  );
}

function OptionRow({
  title, hint, checked, disabled, onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-brown-200 p-3 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} className="mt-0.5" />
    </div>
  );
}
