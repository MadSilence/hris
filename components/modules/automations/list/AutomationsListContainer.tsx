"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, GridViewIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { isFallbackErrorMessage } from "@/lib/errors/errorMessages";
import {
  changeAutomationOwnerAction,
  deleteAutomationAction,
  duplicateAutomationAction,
  archiveAutomationAction,
  takeOverAutomationAction,
  turnOffAutomationAction,
  turnOnAutomationAction,
  unarchiveAutomationAction,
} from "@/components/modules/automations/actions/automationActions";
import {
  useArchivedAutomationsCount,
  useAutomationMutation,
  useAutomations,
} from "@/components/modules/automations/hooks";
import { AiPromptField } from "@/components/modules/automations/shared";
import type { AutomationSummary } from "@/models/automations";
import { AutomationCard, type CardAction } from "./AutomationCard";
import { ChangeOwnerDialog } from "./dialogs/ChangeOwnerDialog";
import { ListConfirmDialog } from "./dialogs/ListConfirmDialog";
import {
  automationsHref,
  EMPTY_FILTERS,
  filterAutomations,
  isFiltered,
  STATUS_CHIPS,
  triggerKeysOf,
  type ListFilters,
  type TriggerKey,
} from "./listModel";

type ConfirmKind = "duplicate" | "archive" | "delete" | "changeOwner" | "makeMeOwner";
type Confirm = { kind: ConfirmKind; automation: AutomationSummary } | null;

/** The sentence a dialog shows when an action is refused: the backend's own when it says something, else the spec's. */
const refusal = (error: unknown, fallback: string): string => {
  const message = error instanceof Error ? error.message : "";
  return message && !isFallbackErrorMessage(message) ? message : fallback;
};

/**
 * The Automations tab (`automations-list`, E1–E7, H3, H5, H6, O1, O2, W3): the toolbar, the grid of cards, every
 * state, and the dialogs and toasts of the card's actions. Opening an automation, editing it and turning it on happen
 * in the editor; this list only routes there.
 */
export const AutomationsListContainer: React.FC<{
  canManage: boolean;
  /** Opens New automation; `templates` — "Pick a template" — opens it at the templates. */
  onOpenNew: (templates: boolean) => void;
}> = ({ canManage, onOpenNew }) => {
  const t = useTranslations("automationsList");
  const tShared = useTranslations("automations");
  const router = useRouter();

  const [filters, setFilters] = React.useState<ListFilters>(EMPTY_FILTERS);
  const [showArchived, setShowArchived] = React.useState(false);
  const [firstId, setFirstId] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<Confirm>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [turnOnNow, setTurnOnNow] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const query = useAutomations(showArchived);
  const archivedCount = useArchivedAutomationsCount();

  const duplicate = useAutomationMutation(duplicateAutomationAction);
  const archive = useAutomationMutation(archiveAutomationAction);
  const unarchive = useAutomationMutation(unarchiveAutomationAction);
  const remove = useAutomationMutation(deleteAutomationAction);
  const turnOff = useAutomationMutation(turnOffAutomationAction);
  const turnOn = useAutomationMutation(turnOnAutomationAction);
  const changeOwner = useAutomationMutation(changeAutomationOwnerAction);
  const takeOver = useAutomationMutation(takeOverAutomationAction);

  const automations = React.useMemo(() => query.data ?? [], [query.data]);
  const shown = React.useMemo(() => filterAutomations(automations, filters, firstId), [automations, filters, firstId]);
  const triggerKeys = React.useMemo(() => triggerKeysOf(automations), [automations]);

  const open = (kind: ConfirmKind, automation: AutomationSummary) => {
    setConfirmError(null);
    setTurnOnNow(false);
    setConfirm({ kind, automation });
  };
  const close = () => {
    setConfirm(null);
    setConfirmError(null);
  };

  const onAction = (action: CardAction, automation: AutomationSummary) => {
    switch (action) {
      case "edit":
        return router.push(automationsHref.edit(automation.id));
      case "turnOn":
        return router.push(automationsHref.turnOn(automation.id));
      case "runHistory":
        return router.push(automationsHref.activity(automation.id));
      case "seeWhy":
        return router.push(automationsHref.seeWhy(automation.id, automation.lastRun?.runId));
      case "fixStep":
        return router.push(automationsHref.fixStep(automation.id, automation.pause?.stepId ?? null));
      case "turnOff":
        return turnOff.mutate(automation.id, {
          onSuccess: () =>
            showUndoToast({
              message: t("toast.turnedOff"),
              onUndo: () => turnOn.mutateAsync({ id: automation.id, request: { backfill: "NONE", confirmVolume: true } }),
            }),
          onError: (error) => showError(error),
        });
      case "unarchive":
        return unarchive.mutate(automation.id, {
          onSuccess: () => showSuccess(t("toast.unarchived")),
          onError: (error) => showError(error),
        });
      case "duplicate":
      case "archive":
      case "delete":
      case "changeOwner":
        return open(action, automation);
      case "makeMeOwner":
        return open("makeMeOwner", automation);
    }
  };

  const confirmDuplicate = async (automation: AutomationSummary) => {
    try {
      const copy = await duplicate.mutateAsync(automation.id);
      setFirstId(copy.id);
      close();
      showSuccess(t("toast.duplicated"));
    } catch (error) {
      setConfirmError(refusal(error, t("duplicate.error")));
    }
  };

  const confirmArchive = async (automation: AutomationSummary) => {
    try {
      await archive.mutateAsync(automation.id);
      close();
      showUndoToast({ message: t("toast.archived"), onUndo: () => unarchive.mutateAsync(automation.id) });
    } catch (error) {
      setConfirmError(refusal(error, t("archive.error")));
    }
  };

  const confirmDelete = async (automation: AutomationSummary) => {
    try {
      await remove.mutateAsync(automation.id);
      close();
      showSuccess(t("toast.deleted"));
    } catch (error) {
      setConfirmError(refusal(error, t("delete.error")));
    }
  };

  const confirmTakeOver = async (automation: AutomationSummary) => {
    try {
      await takeOver.mutateAsync({ id: automation.id, turnOnNow });
      close();
      showSuccess(t("toast.youOwn"));
    } catch (error) {
      setConfirmError(refusal(error, tShared("reason.UNKNOWN")));
    }
  };

  // ── states ────────────────────────────────────────────────────────────────────────────────

  if (query.isLoading) return <ListSkeleton />;

  if (query.error) {
    return (
      <ErrorState
        error={query.error}
        title={t("error.title")}
        message={t("error.description")}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const empty = (
      <EmptyState
        scene="automations"
        title={t("empty.title")}
        description={canManage ? t("empty.description") : ""}
        className="py-16"
        action={
          canManage ? (
            <div className="flex w-full max-w-[672px] flex-col items-center gap-4">
              <AiPromptField
                value={prompt}
                onChange={setPrompt}
                onSubmit={(value) => router.push(automationsHref.newWithAi(value))}
                variant="page"
                className="text-left"
              />
              <div className="flex flex-wrap justify-center gap-2">
                {/* Pill buttons, here only (`automations-list` → Changes to SPEC, 1). */}
                <Button type="button" variant="secondary" size="sm" className="rounded-pill" onClick={() => onOpenNew(true)}>
                  <Icon icon={GridViewIcon} size="sm" />
                  {t("empty.pickTemplate")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => router.push(automationsHref.newFromScratch)}
                >
                  <Icon icon={Add01Icon} size="sm" />
                  {t("empty.fromScratch")}
                </Button>
              </div>
            </div>
          ) : null
        }
      />
  );

  // E2: nothing at all — no toolbar, because there is nothing to search. With something archived the toolbar stays,
  // so the archive can still be reached.
  if (!showArchived && automations.length === 0 && !(archivedCount.data ?? 0)) return empty;

  const searchOnly = filters.q.trim() !== "" && filters.chip === "ALL" && filters.startsWhen === null;

  return (
    <div className="flex flex-col gap-5">
      <ListToolbar
        search={{ value: filters.q, onChange: (q) => setFilters((current) => ({ ...current, q })) }}
        filter={
          <div className="flex items-center gap-2">
            {!showArchived &&
              STATUS_CHIPS.map((chip) => (
                <FilterChip
                  key={chip}
                  selected={filters.chip === chip}
                  onClick={() => setFilters((current) => ({ ...current, chip }))}
                >
                  {t(`toolbar.chips.${chip}`)}
                </FilterChip>
              ))}
            <StartsWhenFilter
              keys={triggerKeys}
              value={filters.startsWhen}
              onChange={(startsWhen) => setFilters((current) => ({ ...current, startsWhen }))}
            />
          </div>
        }
        archived={{
          count: archivedCount.data ?? 0,
          showing: showArchived,
          onChange: (next) => {
            setShowArchived(next);
            setFilters((current) => ({ ...current, chip: "ALL" }));
          },
        }}
      />

      {shown.length === 0 ? (
        !showArchived && automations.length === 0 && !isFiltered(filters) ? (
          empty
        ) : showArchived && !isFiltered(filters) ? (
          <EmptyState scene="archive" title={t("emptyArchive.title")} description={t("emptyArchive.description")} />
        ) : (
          <NoResults
            scene={searchOnly ? "no-results-s" : "no-match-s"}
            title={t("noResults.title")}
            hint={t("noResults.hint")}
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                {t("noResults.clear")}
              </Button>
            }
          />
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((automation) => (
            <li key={automation.id}>
              <AutomationCard automation={automation} canManage={canManage} onAction={onAction} />
            </li>
          ))}
        </ul>
      )}

      <ListConfirmDialog
        open={confirm?.kind === "duplicate"}
        title={t("duplicate.title", { name: confirm?.automation.name ?? "" })}
        confirmLabel={t("duplicate.confirm")}
        busyLabel={t("duplicate.busy")}
        busy={duplicate.isPending}
        error={confirmError}
        onConfirm={() => confirm && void confirmDuplicate(confirm.automation)}
        onCancel={close}
      >
        <p>{t("duplicate.description")}</p>
      </ListConfirmDialog>

      <ListConfirmDialog
        open={confirm?.kind === "archive"}
        tone="archive"
        title={t("archive.title", { name: confirm?.automation.name ?? "" })}
        confirmLabel={t("archive.confirm")}
        busyLabel={t("archive.busy")}
        busy={archive.isPending}
        error={confirmError}
        onConfirm={() => confirm && void confirmArchive(confirm.automation)}
        onCancel={close}
      >
        <p>{t("archive.stops", { waiting: confirm?.automation.waiting ?? 0 })}</p>
        <p>{t("archive.history")}</p>
      </ListConfirmDialog>

      <ListConfirmDialog
        open={confirm?.kind === "delete"}
        tone="destructive"
        title={t("delete.title", { name: confirm?.automation.name ?? "" })}
        confirmLabel={t("delete.confirm")}
        busyLabel={t("delete.busy")}
        busy={remove.isPending}
        error={confirmError}
        onConfirm={() => confirm && void confirmDelete(confirm.automation)}
        onCancel={close}
      >
        <p>{t("delete.description")}</p>
      </ListConfirmDialog>

      <ListConfirmDialog
        open={confirm?.kind === "makeMeOwner"}
        title={t("makeMeOwner.title", { name: confirm?.automation.name ?? "" })}
        confirmLabel={t("makeMeOwner.confirm")}
        busyLabel={t("makeMeOwner.busy")}
        busy={takeOver.isPending}
        error={confirmError}
        onConfirm={() => confirm && void confirmTakeOver(confirm.automation)}
        onCancel={close}
        extra={
          <label className="flex items-center gap-2 text-body text-primary">
            <Checkbox checked={turnOnNow} onCheckedChange={(checked) => setTurnOnNow(checked === true)} />
            {t("makeMeOwner.turnOnNow")}
          </label>
        }
      >
        {confirm?.automation.pause?.reason === "OWNER_LEFT" || confirm?.automation.pause?.reason === "OWNER_LACKS_RIGHT" ? (
          <p>
            {t(`makeMeOwner.${confirm.automation.pause.reason}`, {
              owner: confirm.automation.owner?.name ?? t("card.someone"),
            })}
          </p>
        ) : null}
        <p>{t("makeMeOwner.fromYou")}</p>
      </ListConfirmDialog>

      <ChangeOwnerDialog
        automation={confirm?.kind === "changeOwner" ? confirm.automation : null}
        busy={changeOwner.isPending}
        error={confirmError}
        onCancel={close}
        onConfirm={(owner) => {
          if (!confirm) return;
          changeOwner.mutate(
            { id: confirm.automation.id, userId: owner.id },
            {
              onSuccess: () => {
                close();
                showSuccess(t("toast.ownerChanged", { name: owner.name }));
              },
              onError: (error) => setConfirmError(refusal(error, tShared("reason.UNKNOWN"))),
            },
          );
        }}
      />
    </div>
  );
};

/** "Starts when": a menu of the triggers the listed automations start from, single choice. */
const StartsWhenFilter: React.FC<{
  keys: TriggerKey[];
  value: TriggerKey | null;
  onChange: (value: TriggerKey | null) => void;
}> = ({ keys, value, onChange }) => {
  const t = useTranslations("automationsList");
  const tShared = useTranslations("automations");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterChip withArrow selected={value !== null}>
          {value ? t("toolbar.startsWhenPicked", { trigger: tShared(`trigger.${value}`) }) : t("toolbar.startsWhen")}
        </FilterChip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 p-1">
        <DropdownMenuItem className="gap-2.5 rounded-control px-2.5 py-1.5" onClick={() => onChange(null)}>
          <Icon icon={Tick02Icon} size="sm" className={value === null ? "text-primary" : "invisible"} />
          {t("toolbar.startsWhenAny")}
        </DropdownMenuItem>
        {keys.length > 0 && <DropdownMenuSeparator className="my-1 bg-mist" />}
        {keys.map((key) => (
          <DropdownMenuItem key={key} className="gap-2.5 rounded-control px-2.5 py-1.5" onClick={() => onChange(key)}>
            <Icon icon={Tick02Icon} size="sm" className={value === key ? "text-primary" : "invisible"} />
            {tShared(`trigger.${key}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** E3: the toolbar's shapes, then six cards in the grid's shape. */
const ListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5" aria-busy="true">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-[260px] rounded-control" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-8 w-16 rounded-pill" />
      ))}
      <Skeleton className="h-8 w-28 rounded-pill" />
    </div>
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex h-[212px] flex-col gap-3 rounded-card border border-divider bg-card p-4">
          <Skeleton className="h-6 w-16 rounded-pill" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-control" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="mt-auto flex items-center justify-between border-t border-divider pt-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="size-6 rounded-pill" />
          </div>
        </li>
      ))}
    </ul>
  </div>
);
