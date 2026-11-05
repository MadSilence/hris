"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FileTextIcon, Xls01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Badge } from "@/components/desact/badge";
import { Label } from "@/components/desact/label";
import { Switch } from "@/components/desact/switch";
import {
  triggerExportDownload,
  type ExportDataFormat,
} from "@/components/modules/settings/shared/ExportDataModal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";

/** What the tree is made of. Each kind has its own sentences in the catalogue, in every language. */
export type ExportOrgTreeKind = "department" | "team";

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
  kind: ExportOrgTreeKind;
  /** Everything that can be exported, in tree order. */
  nodes: ExportOrgTreeNode[];
  /** Pre-selected target — usually whatever the canvas has selected. */
  defaultNodeId?: string | null;
  buildExportUrl: (nodeId: string) => string;
};

export function ExportOrgTreeModal({
  isOpen, onClose, kind, nodes, defaultNodeId, buildExportUrl,
}: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  /** The sentences differ by kind in every language, so each kind has its own messages. */
  const n = (key: "title" | "description" | "label" | "placeholder" | "includeSub" | "includeSubHint" | "noSub") =>
    t(`shared.exportOrgTree.${kind}.${key}`);

  const [nodeId, setNodeId] = useState<string>("");
  const [format, setFormat] = useState<ExportDataFormat>("xlsx");
  const [includeSubNodes, setIncludeSubNodes] = useState(false);
  const [includePeople, setIncludePeople] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

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
      setTried(false);
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
    setTried(true);
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
      setError((e as Error)?.message ?? t("shared.exportOrgTree.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{n("title")}</DialogTitle>
          <DialogDescription>
            {n("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Target */}
          <div className="space-y-1.5">
            <Label htmlFor="export-node">{n("label")}</Label>
            <SearchableSelect
              id="export-node"
              options={nodes.map((node) => ({ value: node.id, label: node.name, depth: node.depth }))}
              value={nodeId || null}
              onChange={(v) => setNodeId(v ?? "")}
              placeholder={n("placeholder")}
              disabled={nodes.length === 0}
              clearable={false}
            />
            <FieldError>{tried && !selected ? tCommon("validation.required") : null}</FieldError>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <div className="text-body font-medium">{t("shared.exportFormat.format")}</div>
            <div className="grid grid-cols-2 gap-3">
              <FormatCard
                active={format === "csv"}
                onClick={() => setFormat("csv")}
                icon={<Icon icon={FileTextIcon} size="sm" className="text-secondary" />}
                title="CSV"
                badge={t("shared.exportFormat.csvBadge")}
                hint={t("shared.exportFormat.csvHint")}
              />
              <FormatCard
                active={format === "xlsx"}
                onClick={() => setFormat("xlsx")}
                icon={<Icon icon={Xls01Icon} size="sm" className="text-secondary" />}
                title="XLSX"
                badge={t("shared.exportFormat.xlsxBadge")}
                hint={t("shared.exportFormat.xlsxHint")}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <OptionRow
              title={n("includeSub")}
              hint={hasSubNodes ? n("includeSubHint") : n("noSub")}
              checked={includeSubNodes && hasSubNodes}
              disabled={!hasSubNodes}
              onChange={setIncludeSubNodes}
            />
            <OptionRow
              title={t("shared.exportOrgTree.includePeople")}
              hint={
                peopleAvailable
                  ? t("shared.exportOrgTree.includePeopleHint")
                  : t("shared.exportOrgTree.noPeople")
              }
              checked={includePeople && peopleAvailable}
              disabled={!peopleAvailable}
              onChange={setIncludePeople}
            />
          </div>

          {error && <FormError message={error} />}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {tCommon("actions.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
 >
            {isLoading ? t("shared.exportOrgTree.exporting") : tCommon("actions.export")}
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
      className={`rounded-card border p-4 text-left transition ${
        active ? "border-accent-ring bg-accent-subtle" : "border-divider hover:bg-subtle"
      }`}
 >
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-medium">{title}</div>
        <Badge variant="neutral" className="ml-auto">{badge}</Badge>
      </div>
      <div className="mt-2 text-hint text-tertiary">{hint}</div>
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
      className={`flex items-start justify-between gap-4 rounded-control border border-divider p-3 ${
        disabled ? "opacity-60" : ""
      }`}
 >
      <div className="space-y-0.5">
        <p className="text-body font-medium text-primary">{title}</p>
        <p className="text-hint text-tertiary">{hint}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} className="mt-0.5" />
    </div>
  );
}
