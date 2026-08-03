"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";

import { useAppDataContext } from "@/components/providers/AppDataProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";

import { USER_STATUSES, formatUserStatus } from "@/models/user/status";
import type { FieldDTO } from "@/models/user/fields";
import { canAccess, type ResourceCode } from "@/models/access";
import type { BulkEditRequest, BulkOperation } from "@/models/bulkEdit";
import { useAccess } from "@/components/auth/useAccess";
import { useAudienceFieldOptions } from "@/components/audience/hooks/useAudienceFieldOptions";
import {
  buildEditableFields,
  type EditField,
} from "@/components/modules/organization/components/BulkEdit/utils/bulkEditFields";
import { useBulkEdit, useBulkEditJob } from "@/components/modules/organization/components/BulkEdit/hooks/useBulkEdit";
import { isTerminalJobStatus } from "@/api/modules/assignments/dto/SegmentAssignmentDTO";
import type { FilterDTO } from "@/models/user/fields";

export type BulkEditTarget =
  | { kind: "ids"; userIds: string[] }
  | { kind: "segment"; filters: FilterDTO[] };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  target: BulkEditTarget;
  count: number | null;
  fields: FieldDTO[];
  onApplied: () => void;
};

const OP_LABELS: Record<BulkOperation, string> = {
  SET: "Set",
  CLEAR: "Clear",
  ADD: "Add",
  REMOVE: "Remove",
};

export default function BulkEditModal({ isOpen, onClose, target, count, fields, onApplied }: Props) {
  const { access } = useAccess();
  const editableFields = useMemo(
    () =>
      buildEditableFields(
        fields,
        (r: ResourceCode) => canAccess({ access, resource: r, action: "EDIT" }),
        (r: ResourceCode) => canAccess({ access, resource: r, action: "MANAGE" }),
      ),
    [fields, access],
  );

  const [fieldKey, setFieldKey] = useState<string>("");
  const [operation, setOperation] = useState<BulkOperation>("SET");
  const [single, setSingle] = useState<string>("");
  const [multi, setMulti] = useState<string[]>([]);
  const [bool, setBool] = useState<boolean>(false);
  const [confirming, setConfirming] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const field = editableFields.find((f) => f.key === fieldKey) ?? null;
  const bulkEdit = useBulkEdit();
  const job = useBulkEditJob(jobId);

  useEffect(() => {
    if (!isOpen) {
      setFieldKey("");
      setJobId(null);
      setConfirming(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setOperation(field?.operations[0] ?? "SET");
    setSingle("");
    setMulti([]);
    setBool(false);
    setConfirming(false);
  }, [fieldKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (job.data && isTerminalJobStatus(job.data.status)) {
      onApplied();
      onClose();
    }
  }, [job.data, onApplied, onClose]);

  const isClear = operation === "CLEAR";
  const isStatus = field?.kind === "status";

  const buildValue = (): unknown => {
    if (isClear) return undefined;
    if (field?.kind === "attr" && field.attrType === "MULTI_SELECT") return multi;
    if (field?.kind === "attr" && field.attrType === "CHECKBOX") return bool;
    if (field?.kind === "attr" && field.attrType === "NUMBER") return single;
    return single;
  };

  const valueReady =
    isClear ||
    (field?.kind === "attr" && field.attrType === "MULTI_SELECT" ? multi.length > 0 : false) ||
    (field?.kind === "attr" && field.attrType === "CHECKBOX" ? true : false) ||
    single.trim().length > 0;

  const canSubmit = !!field && valueReady && !bulkEdit.isPending && !jobId;

  const doSubmit = () => {
    if (!field) return;
    const base: BulkEditRequest =
      target.kind === "ids"
        ? { userIds: target.userIds, field: field.key, operation, value: buildValue() }
        : { segment: { filters: target.filters }, field: field.key, operation, value: buildValue() };

    bulkEdit.mutate(base, {
      onSuccess: (res) => {
        if (res.mode === "async" && res.jobId) {
          setJobId(res.jobId);
        } else {
          onApplied();
          onClose();
        }
      },
    });
  };

  const onApply = () => {
    if (isStatus && !confirming) {
      setConfirming(true);
      return;
    }
    doSubmit();
  };

  const targetLabel = count == null ? "all people matching the current filters" : `${count} ${count === 1 ? "person" : "people"}`;
  const busy = bulkEdit.isPending || !!jobId;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit people</DialogTitle>
          <DialogDescription>Apply a change to {targetLabel}.</DialogDescription>
        </DialogHeader>

        {jobId ? (
          <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Applying… {job.data ? `(${job.data.summary?.created ?? 0}/${job.data.summary?.total ?? "?"})` : ""}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-1">
            {/* Field */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Field</span>
              <Select value={fieldKey} onValueChange={setFieldKey}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {editableFields.map((f) => (
                    <SelectItem key={f.key} value={f.key}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation (when more than one) */}
            {field && field.operations.length > 1 ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Action</span>
                <Select value={operation} onValueChange={(v) => setOperation(v as BulkOperation)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.operations.map((op) => (
                      <SelectItem key={op} value={op}>
                        {OP_LABELS[op]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Value */}
            {field && !isClear ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Value</span>
                <ValueEditor
                  field={field}
                  single={single}
                  setSingle={setSingle}
                  multi={multi}
                  setMulti={setMulti}
                  bool={bool}
                  setBool={setBool}
                />
              </div>
            ) : null}

            {isStatus && confirming ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  This changes the status of {targetLabel} to{" "}
                  <b>{formatUserStatus(single)}</b>. Click Confirm to proceed.
                </span>
              </div>
            ) : null}

            {bulkEdit.isError ? (
              <p className="text-xs text-red-600">{bulkEdit.error?.message ?? "Something went wrong."}</p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onApply} disabled={!canSubmit}>
            {bulkEdit.isPending ? "Applying…" : isStatus && confirming ? "Confirm" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ValueEditor({
  field,
  single,
  setSingle,
  multi,
  setMulti,
  bool,
  setBool,
}: {
  field: EditField;
  single: string;
  setSingle: (v: string) => void;
  multi: string[];
  setMulti: (v: string[]) => void;
  bool: boolean;
  setBool: (v: boolean) => void;
}) {
  if (field.kind === "status") {
    return (
      <SelectOne
        value={single}
        onChange={setSingle}
        options={USER_STATUSES.map((s) => ({ id: s, label: formatUserStatus(s) }))}
        placeholder="Select status"
      />
    );
  }

  if (field.kind === "role") {
    return <RoleSelect value={single} onChange={setSingle} />;
  }

  if (field.kind === "association") {
    return <RemoteSelect source={field.valueSource} value={single} onChange={setSingle} />;
  }

  const type = field.attrType;
  if (type === "SELECT") {
    return <SelectOne value={single} onChange={setSingle} options={field.options ?? []} placeholder="Select value" />;
  }
  if (type === "MULTI_SELECT") {
    return (
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-2">
        {(field.options ?? []).map((o) => {
          const checked = multi.includes(o.id);
          return (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={checked}
                onCheckedChange={(v) =>
                  setMulti(v === true ? [...multi, o.id] : multi.filter((x) => x !== o.id))
                }
              />
              {o.label}
            </label>
          );
        })}
      </div>
    );
  }
  if (type === "CHECKBOX") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={bool} onCheckedChange={(v) => setBool(v === true)} />
        {bool ? "Checked" : "Unchecked"}
      </label>
    );
  }
  const inputType = type === "NUMBER" ? "number" : type === "DATE" ? "date" : "text";
  return (
    <Input
      type={inputType}
      value={single}
      onChange={(e) => setSingle(e.target.value)}
      placeholder="Value"
      className="h-9"
    />
  );
}

function SelectOne({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RemoteSelect({
  source,
  value,
  onChange,
}: {
  source: EditField["valueSource"];
  value: string;
  onChange: (v: string) => void;
}) {
  const { options, isLoading } = useAudienceFieldOptions(source as any);
  return (
    <SelectOne value={value} onChange={onChange} options={options} placeholder={isLoading ? "Loading…" : "Select value"} />
  );
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { internalApiClient } = useAppDataContext();
  const { data, isLoading } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["BULK_EDIT_ROLES"],
    queryFn: () => internalApiClient.get<{ id: string; name: string }[]>("/roles"),
    staleTime: 5 * 60 * 1000,
  });
  const options = (data ?? []).map((r) => ({ id: r.id, label: r.name }));
  return <SelectOne value={value} onChange={onChange} options={options} placeholder={isLoading ? "Loading…" : "Select role"} />;
}
