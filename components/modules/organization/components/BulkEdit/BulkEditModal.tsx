"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { NodRing } from "@/components/desact/nod";

import { useAppDataContext } from "@/components/providers/AppDataProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";

import { USER_STATUSES, formatUserStatus } from "@/models/user/status";
import type { FieldDTO } from "@/models/user/fields";
import { canAccess, type ResourceCode } from "@/models/access";
import type { BulkEditRequest, BulkEditResult, BulkOperation } from "@/models/bulkEdit";
import { useAccess } from "@/components/auth/useAccess";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { useAudienceFieldOptions } from "@/components/audience/hooks/useAudienceFieldOptions";
import {
  buildEditableFields,
  type EditField,
} from "@/components/modules/organization/components/BulkEdit/utils/bulkEditFields";
import { useBulkEdit, useBulkEditJob } from "@/components/modules/organization/components/BulkEdit/hooks/useBulkEdit";
import { isTerminalJobStatus } from "@/api/modules/assignments/dto/SegmentAssignmentDTO";
import {
  isReferenceValueSource,
  type DraftVisibility,
  type FilterDTO,
  type ReferenceValueSource,
} from "@/models/user/fields";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { InlineAlert } from "@/components/desact/alert";

export type BulkEditTarget =
  | { kind: "ids"; userIds: string[] }
  // Everyone the table holds for its search, filters and drafts segment — "Select All N Matching".
  | { kind: "segment"; filters: FilterDTO[]; q?: string | null; drafts?: DraftVisibility | null };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  target: BulkEditTarget;
  count: number | null;
  fields: FieldDTO[];
  onApplied: () => void;
};

export default function BulkEditModal({ isOpen, onClose, target, count, fields, onApplied }: Props) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const { access } = useAccess();
  const editableFields = useMemo(
    () =>
      buildEditableFields(
        fields,
        (r: ResourceCode) => canAccess({ access, resource: r, action: "EDIT" }),
        (r: ResourceCode) => canAccess({ access, resource: r, action: "MANAGE" }),
        t,
      ),
    [fields, access, t],
  );

  const [fieldKey, setFieldKey] = useState<string>("");
  const [operation, setOperation] = useState<BulkOperation>("SET");
  const [single, setSingle] = useState<string>("");
  const [multi, setMulti] = useState<string[]>([]);
  const [bool, setBool] = useState<boolean>(false);
  const [confirming, setConfirming] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  // Set when the backend refuses to write because some targets fall outside the actor's access.
  const [outOfScope, setOutOfScope] = useState<BulkEditResult | null>(null);

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

  const doSubmit = (confirmPartial = false) => {
    if (!field) return;
    const base: BulkEditRequest =
      target.kind === "ids"
        ? { userIds: target.userIds, field: field.key, operation, value: buildValue(), confirmPartial }
        : {
            segment: { filters: target.filters, q: target.q ?? null, drafts: target.drafts ?? null },
            field: field.key,
            operation,
            value: buildValue(),
            confirmPartial,
          };

    bulkEdit.mutate(base, {
      onSuccess: (res) => {
        if (res.mode === "out_of_scope") {
          // Nothing was written: the backend is asking whether to proceed without the people this
          // account cannot reach.
          setOutOfScope(res);
          return;
        }
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

  const fullName = (b: { firstName?: string | null; lastName?: string | null; email: string }) =>
    `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim() || b.email;

  const targetLabel = count == null ? t("bulkEdit.targetAll") : tCommon("people.count", { count });
  const busy = bulkEdit.isPending || !!jobId;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("bulkEdit.title")}</DialogTitle>
          <DialogDescription>{t("bulkEdit.description", { target: targetLabel })}</DialogDescription>
        </DialogHeader>

        {outOfScope ? (
          <div className="flex flex-col gap-3 py-1">
            <p className="text-body">
              {t("bulkEdit.outOfScope", { count: outOfScope.blocked?.length ?? 0 })}
            </p>

            <div className="max-h-56 overflow-y-auto rounded-control border border-divider">
              <table className="w-full text-body">
                <tbody>
                  {outOfScope.blocked?.map((b) => (
                    <tr key={b.userId} className="border-b border-divider last:border-0">
                      <td className="px-3 py-2">
                        <div className="font-medium">{fullName(b)}</div>
                        <div className="text-hint text-tertiary">{b.email}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-hint text-tertiary">
                        {t("bulkEdit.outsideAccess")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : jobId ? (
          <div className="flex items-center gap-3 py-6 text-body text-tertiary">
            <NodRing size="sm" label="" />
            {job.data
              ? t("bulkEdit.applyingProgress", {
                  done: job.data.summary?.created ?? 0,
                  total: job.data.summary?.total ?? "?",
                })
              : t("bulkEdit.applying")}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-1">
            {/* Field */}
            <div className="flex flex-col gap-1.5">
              <span className="text-hint font-medium text-tertiary">{t("bulkEdit.field")}</span>
              <SearchableSelect
                className="h-9"
                aria-label={t("bulkEdit.field")}
                options={editableFields.map((f) => ({ value: f.key, label: f.label }))}
                value={fieldKey || null}
                onChange={(v) => setFieldKey(v ?? "")}
                placeholder={t("bulkEdit.selectField")}
                clearable={false}
              />
            </div>

            {/* Operation (when more than one) */}
            {field && field.operations.length > 1 ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-hint font-medium text-tertiary">{t("bulkEdit.action")}</span>
                <Select value={operation} onValueChange={(v) => setOperation(v as BulkOperation)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.operations.map((op) => (
                      <SelectItem key={op} value={op}>
                        {t(`bulkEdit.operation.${op}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Value */}
            {field && !isClear ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-hint font-medium text-tertiary">{t("bulkEdit.value")}</span>
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
              <InlineAlert tone="pending" icon={Alert02Icon}>
                {t.rich("bulkEdit.confirmStatus", {
                  target: targetLabel,
                  status: formatUserStatus(tCommon, single),
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </InlineAlert>
            ) : null}

            {bulkEdit.isError ? <FormError message={messageForError(bulkEdit.error)}/> : null}
          </div>
        )}

        <DialogFooter>
          {outOfScope ? (
            <>
              {/* Back to the selection, rather than a dead end. */}
              <Button type="button" variant="ghost" onClick={() => setOutOfScope(null)} disabled={bulkEdit.isPending}>
                {t("bulkEdit.backToSelection")}
              </Button>
              <Button type="button" onClick={() => doSubmit(true)} disabled={bulkEdit.isPending || !outOfScope.allowedCount}>
                {bulkEdit.isPending
                  ? t("bulkEdit.applying")
                  : t("bulkEdit.applyAllowed", { count: outOfScope.allowedCount ?? 0 })}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                {tCommon("actions.cancel")}
              </Button>
              <Button type="button" onClick={onApply} disabled={!canSubmit}>
                {bulkEdit.isPending
                  ? t("bulkEdit.applying")
                  : isStatus && confirming
                    ? tCommon("actions.confirm")
                    : tCommon("actions.apply")}
              </Button>
            </>
          )}
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
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  if (field.kind === "status") {
    return (
      <SelectOne
        value={single}
        onChange={setSingle}
        options={USER_STATUSES.map((s) => ({ id: s, label: formatUserStatus(tCommon, s) }))}
        placeholder={t("bulkEdit.selectStatus")}
      />
    );
  }

  if (field.kind === "role") {
    return <RoleSelect value={single} onChange={setSingle} />;
  }

  // The guard is what tells the compiler what the "association" kind already guarantees: its source
  // is a reference catalogue, never "status" or "attribute".
  if (field.kind === "association" && isReferenceValueSource(field.valueSource)) {
    return <RemoteSelect source={field.valueSource} value={single} onChange={setSingle} />;
  }

  const type = field.attrType;
  if (type === "SELECT") {
    return <SelectOne value={single} onChange={setSingle} options={field.options ?? []} placeholder={t("bulkEdit.selectValue")} searchable />;
  }
  if (type === "MULTI_SELECT") {
    return (
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-control border p-2">
        {(field.options ?? []).map((o) => {
          const checked = multi.includes(o.id);
          return (
            <label key={o.id} className="flex items-center gap-2 text-body">
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
      <label className="flex items-center gap-2 text-body">
        <Checkbox checked={bool} onCheckedChange={(v) => setBool(v === true)} />
        {bool ? t("bulkEdit.checked") : t("bulkEdit.unchecked")}
      </label>
    );
  }
  const inputType = type === "NUMBER" ? "number" : type === "DATE" ? "date" : "text";
  return (
    <Input
      type={inputType}
      value={single}
      onChange={(e) => setSingle(e.target.value)}
      className="h-9"
    />
  );
}

function SelectOne({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  /** Data — the company's records or a company-defined option list — is searched; a vocabulary is not. */
  searchable?: boolean;
}) {
  const t = useTranslations("organization");
  if (searchable) {
    return (
      <SearchableSelect
        className="h-9"
        aria-label={t("bulkEdit.value")}
        options={options.map((o) => ({ value: o.id, label: o.label }))}
        value={value || null}
        onChange={(v) => onChange(v ?? "")}
        placeholder={placeholder}
        clearable={false}
      />
    );
  }
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
  source: ReferenceValueSource;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const { options, isLoading } = useAudienceFieldOptions(source);
  return (
    <SelectOne value={value} onChange={onChange} options={options} placeholder={isLoading ? tCommon("states.loading") : t("bulkEdit.selectValue")} searchable />
  );
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const { internalApiClient } = useAppDataContext();
  const { data, isLoading } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["BULK_EDIT_ROLES"],
    queryFn: () => internalApiClient.get<{ id: string; name: string }[]>("/roles"),
    staleTime: 5 * 60 * 1000,
  });
  const options = (data ?? []).map((r) => ({ id: r.id, label: r.name }));
  return <SelectOne value={value} onChange={onChange} options={options} placeholder={isLoading ? tCommon("states.loading") : t("bulkEdit.selectRole")} searchable />;
}
