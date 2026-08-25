"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import {
  triggerExportDownload,
  type ExportDataFormat,
} from "@/components/modules/settings/shared/ExportDataModal";

type Noun = "department" | "team";

/** One selectable export target. `depth` is 0 for a root node and only drives the indentation. */
export type ExportOrgTreeNode = {
  id: string;
  name: string;
  depth: number;
  directSubNodes: number;
  memberCount: number;
  totalPeople: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  noun: Noun;
  /** Everything that can be exported, in tree order. */
  nodes: ExportOrgTreeNode[];
  /** Pre-selected target — usually whatever the canvas has selected. */
  defaultNodeId?: string | null;
  buildExportUrl: (nodeId: string) => string;
};

export function ExportOrgTreeModal({
  isOpen, onClose, noun, nodes, defaultNodeId, buildExportUrl,
}: Props) {
  const subLabel = noun === "department" ? "sub-departments" : "sub-teams";
  const nounLabel = noun === "department" ? "Department" : "Team";

  const [nodeId, setNodeId] = useState<string>("");
  const [format, setFormat] = useState<ExportDataFormat>("xlsx");
  const [includeSubNodes, setIncludeSubNodes] = useState(false);
  const [includePeople, setIncludePeople] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => nodes.find((node) => node.id === nodeId) ?? null,
    [nodes, nodeId],
  );

  const hasSubNodes = (selected?.directSubNodes ?? 0) > 0;
  const peopleAvailable = includeSubNodes
    ? (selected?.totalPeople ?? 0) > 0
    : (selected?.memberCount ?? 0) > 0;

  useEffect(() => {
    if (isOpen) {
      setNodeId(defaultNodeId ?? nodes[0]?.id ?? "");
      setFormat("xlsx");
      setIncludeSubNodes(false);
      setIncludePeople(false);
      setError(null);
    }
    // Re-running on every `nodes` identity change would reset a choice mid-dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The scope options belong to a node; switching target has to drop whatever was ticked for the
  // previous one, since it may not offer the same scopes at all.
  useEffect(() => {
    setIncludeSubNodes(false);
    setIncludePeople(false);
  }, [nodeId]);

  useEffect(() => {
    if (includePeople && !peopleAvailable) setIncludePeople(false);
  }, [includePeople, peopleAvailable]);

  const handleExport = async () => {
    if (!selected) return;

    setIsLoading(true);
    setError(null);
    try {
      await triggerExportDownload(buildExportUrl(selected.id), format, {
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
          <DialogTitle>Export {noun}</DialogTitle>
          <DialogDescription>
            Pick a {noun} and download it as a spreadsheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Target */}
          <div className="space-y-1.5">
            <Label htmlFor="export-node">{nounLabel}</Label>
            <Select value={nodeId} onValueChange={setNodeId} disabled={nodes.length === 0}>
              <SelectTrigger id="export-node" className="w-full">
                <SelectValue placeholder={`Select a ${noun}`} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    <span style={{ paddingLeft: node.depth * 12 }}>{node.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            disabled={isLoading || !selected}
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
