"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { InlineAlert } from "@/components/desact/alert";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import {
  GO_LIVE_KINDS,
  keepKey,
  type CompanyState,
  type GoLiveCountKey,
  type GoLiveItem,
  type GoLiveStatus,
} from "@/models/demo";
import { requestGoLiveAction, retryGoLiveAction } from "@/components/modules/demo/actions/goLiveActions";
import {
  useCompanyState,
  useGoLivePreview,
  useGoLiveStatus,
  useInvalidateDemo,
} from "@/components/modules/demo/hooks";

const COUNT_KEYS: GoLiveCountKey[] = [
  "samplePeople",
  "timeOffRequests",
  "processes",
  "documents",
  "attendanceEntries",
  "automationRuns",
  "reviewCycles",
  "journalLines",
];

/**
 * Settings → *Go live* (DEMO_PLAN.md 6.6; R5.3, B2, P3): the company's state, the Keep/Delete list of the example's
 * set-up with what goes regardless, one confirmation naming what cannot be undone — then "waiting for activation"
 * until the operator acts, then the progress, as the setup wizard's. One way only: nothing here leads back.
 *
 * The first build follows `technical_documentation/ui/` and waits for the designers' review (`hris/design/briefs/`).
 */
export function GoLiveContainer() {
  const state = useCompanyState();
  const status = useGoLiveStatus();
  const asked = status.data != null;
  const preview = useGoLivePreview(status.isSuccess && !asked);

  if (state.error || status.error) return <ErrorState error={state.error ?? status.error} />;
  if (!state.data || status.isLoading) return <Skeleton className="h-64 w-full rounded-card" aria-busy="true" />;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <StateLine state={state.data} />
      {asked ? (
        <Progress status={status.data as GoLiveStatus} />
      ) : preview.error ? (
        <ErrorState error={preview.error} />
      ) : !preview.data ? (
        <Skeleton className="h-64 w-full rounded-card" aria-busy="true" />
      ) : (
        <Choose items={preview.data.items} counts={preview.data.counts} demo={preview.data.isDemo}
          live={state.data.status === "ACTIVE" || state.data.status === "COMPED"} />
      )}
    </div>
  );
}

function StateLine({ state }: { state: CompanyState }) {
  const t = useTranslations("demo.goLive.status");
  if (state.status === "TRIALING") return <StatusBadge status="scheduled" label={t("trial", { days: state.trialDaysLeft ?? 0 })} />;
  if (state.status === "READ_ONLY") return <StatusBadge status="declined" label={t("readOnly")} />;
  return <StatusBadge status="approved" label={state.status === "ACTIVE" ? t("active") : t("comped")} />;
}

function Choose({ items, counts, demo, live }: {
  items: GoLiveItem[];
  counts: Partial<Record<GoLiveCountKey, number>>;
  demo: boolean;
  live: boolean;
}) {
  const t = useTranslations("demo.goLive");
  const invalidate = useInvalidateDemo();
  const [keep, setKeep] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKeep(Object.fromEntries(items.map((i) => [keepKey(i), i.keep])));
  }, [items]);

  const byKind = useMemo(
    () => GO_LIVE_KINDS.map((kind) => ({ kind, rows: items.filter((i) => i.kind === kind) })).filter((g) => g.rows.length > 0),
    [items],
  );

  // A live company with nothing of the example left has nothing to do here.
  if (live && !demo) return null;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await requestGoLiveAction(Object.entries(keep).filter(([, k]) => k).map(([key]) => key));
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? null);
        return;
      }
      setConfirming(false);
      showSuccess(t("requestedToast"));
      await invalidate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Walk of 2026-11-14: an empty trial was told its sample people would be deleted — it has none. */}
      {demo && <p className="text-body text-secondary">{t("description")}</p>}

      {!demo ? (
        <InlineAlert title={t("empty.title")}>{t("empty.body")}</InlineAlert>
      ) : (
        <>
          <section className="space-y-3 rounded-card border border-divider bg-card p-5">
            <h2 className="text-card-title text-primary">{t("goes.title")}</h2>
            <ul className="list-disc space-y-1 pl-5 text-body text-primary">
              {COUNT_KEYS.filter((key) => (counts[key] ?? 0) > 0).map((key) => (
                <li key={key}>{t(`goes.${key}`, { count: counts[key] ?? 0 })}</li>
              ))}
            </ul>
          </section>

          {byKind.length > 0 && (
            <section className="space-y-4 rounded-card border border-divider bg-card p-5">
              <div className="space-y-1">
                <h2 className="text-card-title text-primary">{t("list.title")}</h2>
                <p className="text-body text-tertiary">{t("list.body")}</p>
              </div>
              {byKind.map(({ kind, rows }) => (
                <div key={kind} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-body font-medium text-primary">{t(`list.kind.${kind}`)}</h3>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => setKeep((k) => ({ ...k, ...Object.fromEntries(rows.map((r) => [keepKey(r), true])) }))}>
                        {t("list.keepAll")}
                      </Button>
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => setKeep((k) => ({ ...k, ...Object.fromEntries(rows.map((r) => [keepKey(r), false])) }))}>
                        {t("list.deleteAll")}
                      </Button>
                    </div>
                  </div>
                  <ul className="divide-y divide-divider rounded-control border border-divider">
                    {rows.map((row) => (
                      <li key={keepKey(row)} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-body text-primary">{row.name}</p>
                          <p className="text-hint text-tertiary">{t(`list.reason.${row.reason}`)}</p>
                        </div>
                        <SegmentedControl<"keep" | "delete">
                          fill={false}
                          aria-label={row.name}
                          value={keep[keepKey(row)] ? "keep" : "delete"}
                          onChange={(v) => setKeep((k) => ({ ...k, [keepKey(row)]: v === "keep" }))}
                          options={[
                            { value: "keep", label: t("list.keep") },
                            { value: "delete", label: t("list.delete") },
                          ]}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      <div>
        <Button type="button" variant={demo ? "destructive" : "primary"} onClick={() => setConfirming(true)}>
          {t("request")}
        </Button>
      </div>
      <FormError message={confirming ? null : error} />

      <ConfirmActionModal
        isOpen={confirming}
        title={t("confirm.title")}
        description={demo ? t("confirm.body") : t("empty.body")}
        confirmLabel={t("confirm.confirm")}
        destructive={demo}
        isLoading={busy}
        errorMessage={error}
        onConfirmAction={send}
        onCancelAction={() => {
          setConfirming(false);
          setError(null);
        }}
      />
    </>
  );
}

function Progress({ status }: { status: GoLiveStatus }) {
  const t = useTranslations("demo.goLive");
  const formatDate = useDateFormatter();
  const invalidate = useInvalidateDemo();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The banner and the menu read the state; refresh them when the run ends.
    if (status.status === "DONE") void invalidate();
  }, [status.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await retryGoLiveAction();
      if (res.status !== ActionStatus.SUCCESS) setError(res.errorMessage ?? null);
      else await invalidate();
    } finally {
      setBusy(false);
    }
  };

  const tone = status.status === "DONE" ? "approved" : status.status === "FAILED" ? "declined" : "pending";
  return (
    <div className="space-y-3">
      <InlineAlert tone={tone}>{t(`state.${status.status}`)}</InlineAlert>
      {status.requestedByName && status.requestedAt && (
        <p className="text-hint text-tertiary">
          {t("requestedBy", { name: status.requestedByName, date: formatDate(status.requestedAt, { style: "medium" }) })}
        </p>
      )}
      {status.status === "FAILED" && (
        <Button type="button" variant="secondary" disabled={busy} onClick={retry}>{t("retry")}</Button>
      )}
      <FormError message={error} />
    </div>
  );
}
