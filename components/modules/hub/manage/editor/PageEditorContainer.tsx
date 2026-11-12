"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Alert02Icon, ArrowDown01Icon, ArrowLeft01Icon, PencilEdit02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { InlineAlert } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { Skeleton } from "@/components/desact/skeleton";
import { Switch } from "@/components/desact/switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DraftWrite, HubAudience, PageEdit, PublishRequest } from "@/models/hub";
import { publishHubPageAction, saveHubPageDraftAction, updateHubPagePropsAction } from "../../actions";
import { PageBodyEditor } from "../../document";
import { HubActionError, hubQueryKeys, unwrapHub, useInvalidateHub, usePageEdit, usePageTree } from "../../hooks";
import { HubReadError, hubIcon, useAudienceLabel, useHubDates } from "../../shared";
import { AudienceDialog, HubPeopleField } from "../audience";
import { IconColorPicker } from "../IconColorPicker";
import { PublishPageDialog } from "./PublishPageDialog";

/** The editor's text, saved as the draft on every pause (1 s). */
type Draft = { title: string; icon: string | null; color: string | null; body: string; mustRead: boolean; agreeBy: string | null };

export type SaveState = "saved" | "saving" | "error" | "conflict";

/** One pause of the author: the draft saves this long after the last change (CM06 Autosave). */
export const AUTOSAVE_MS = 1000;
/** A failed save retries this often until it works ("Not saved", CM06 States). */
export const RETRY_MS = 10_000;

const draftOf = (page: PageEdit): Draft => ({
  title: page.title,
  icon: page.icon,
  color: page.color,
  body: page.body,
  mustRead: page.mustRead,
  agreeBy: page.agreeBy,
});

/**
 * The draft's autosave: every change waits a pause, then goes up with the version it was based on. A newer version
 * elsewhere (HB00009) stops it — the author is told to reload rather than overwrite. Any other failure retries.
 */
const useAutosave = (id: string, initialVersion: number, onSaved: (savedAt: string) => void) => {
  const [state, setState] = React.useState<SaveState>("saved");
  const version = React.useRef(initialVersion);
  const pending = React.useRef<Draft | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = React.useRef<Promise<void> | null>(null);
  const stopped = React.useRef(false);
  const onSavedRef = React.useRef(onSaved);
  onSavedRef.current = onSaved;

  const flush = React.useCallback(async (): Promise<void> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inflight.current) await inflight.current;
    const draft = pending.current;
    if (!draft || stopped.current) return;
    pending.current = null;
    setState("saving");
    const write: DraftWrite = { ...draft, expectedVersion: version.current };
    inflight.current = (async () => {
      try {
        const saved = unwrapHub(await saveHubPageDraftAction({ id, write }));
        version.current = saved.version;
        setState(pending.current ? "saving" : "saved");
        onSavedRef.current(saved.savedAt);
      } catch (error) {
        if (error instanceof HubActionError && error.code === "HB00009") {
          stopped.current = true;
          setState("conflict");
          return;
        }
        pending.current = pending.current ?? draft;
        setState("error");
        timer.current = setTimeout(() => void flush(), RETRY_MS);
      } finally {
        inflight.current = null;
      }
    })();
    await inflight.current;
    if (pending.current && !timer.current && !stopped.current) timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
  }, [id]);

  const schedule = React.useCallback(
    (draft: Draft) => {
      if (stopped.current) return;
      pending.current = draft;
      setState((s) => (s === "error" ? s : "saving"));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      // Leaving the page: whatever is still waiting goes up now.
      if (pending.current && !stopped.current) void flush();
    },
    [flush],
  );

  return { state, schedule, flush };
};

const PropertyRow: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string }> = ({ label, children, htmlFor }) => (
  <div className="grid min-h-9 grid-cols-[150px_minmax(0,1fr)] items-center gap-2">
    <label htmlFor={htmlFor} className="text-hint text-tertiary">
      {label}
    </label>
    <div className="min-w-0">{children}</div>
  </div>
);

const Editor: React.FC<{ page: PageEdit }> = ({ page }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const audienceLabel = useAudienceLabel();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateHub();
  const tree = usePageTree();
  const [draft, setDraft] = React.useState<Draft>(() => draftOf(page));
  const [savedAt, setSavedAt] = React.useState<string | null>(page.savedAt);
  const [unpublished, setUnpublished] = React.useState(page.unpublishedChanges || page.status !== "PUBLISHED");
  const [props, setProps] = React.useState({
    sectionId: page.sectionId,
    sectionName: page.sectionName,
    owner: page.owner,
    audience: page.audience,
    audienceLabel: page.audienceLabel,
  });
  const [audienceOpen, setAudienceOpen] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [versionNo, setVersionNo] = React.useState(page.versionNo);
  const [everPublished, setEverPublished] = React.useState(page.status === "PUBLISHED" || page.versionNo > 0);
  const autosave = useAutosave(page.id, page.version, (at) => setSavedAt(at));

  const draftRef = React.useRef(draft);
  const change = (next: Partial<Draft>) => {
    const merged = { ...draftRef.current, ...next };
    draftRef.current = merged;
    setDraft(merged);
    autosave.schedule(merged);
    setUnpublished(true);
  };

  const saveProps = async (write: { sectionId?: string | null; ownerUserId?: string | null; audience?: HubAudience | null }) => {
    try {
      unwrapHub(
        await updateHubPagePropsAction({
          id: page.id,
          write: { sectionId: write.sectionId ?? null, ownerUserId: write.ownerUserId ?? null, audience: write.audience ?? null },
        }),
      );
      void queryClient.invalidateQueries({ queryKey: hubQueryKeys.tree });
    } catch {
      toast.error(t("settings.saveFailed"));
    }
  };

  const publish = async (request: PublishRequest) => {
    await autosave.flush();
    const result = unwrapHub(await publishHubPageAction({ id: page.id, request }));
    setVersionNo(result.versionNo);
    setEverPublished(true);
    setUnpublished(false);
    void invalidate();
    toast.success(t("editor.published", { version: result.versionNo }));
  };

  const openPreview = async () => {
    await autosave.flush();
    window.open(`/hub/handbook/${page.id}?preview=1`, "_blank", "noopener");
  };

  const sections = tree.data?.sections ?? [];
  const nextVersion = everPublished ? versionNo + 1 : 1;
  const tile = TAG_CLASSES[toTagColor(draft.color)];

  return (
    <div className="flex flex-col xl:px-4">
      {/* The editor bar. */}
      <div className="sticky top-0 z-20 -mx-2 flex items-center gap-3 bg-page px-2 py-2">
        <Link href="/hub/manage/pages" className="inline-flex items-center gap-1 text-label text-secondary no-underline hover:text-primary">
          <Icon icon={ArrowLeft01Icon} size="sm" />
          {t("manage.tabs.pages")}
        </Link>
        {props.sectionName && <span className="truncate text-label text-tertiary">/ {props.sectionName}</span>}
        <span className="ml-auto flex items-center gap-3">
          {autosave.state === "saving" ? (
            <span className="text-hint text-tertiary">{t("editor.saving")}</span>
          ) : autosave.state === "error" ? (
            <span role="alert" className="inline-flex items-center gap-1 text-hint text-danger-text">
              <Icon icon={Alert02Icon} size="sm" />
              {t("editor.notSaved")}
            </span>
          ) : autosave.state === "saved" && savedAt ? (
            <span className="text-hint text-tertiary">{t("editor.savedAt", { time: dates.time(savedAt) })}</span>
          ) : null}
          {unpublished && everPublished && (
            <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-status-inactive-bg px-2 text-hint font-semibold text-status-inactive-text">
              <Icon icon={PencilEdit02Icon} size="sm" />
              {t("editor.unpublishedChanges")}
            </span>
          )}
          <Button type="button" variant="secondary" onClick={() => void openPreview()}>
            {t("editor.preview")}
          </Button>
          <Button type="button" disabled={autosave.state === "conflict"} onClick={() => setPublishOpen(true)}>
            {everPublished ? t("editor.publishVersion", { version: nextVersion }) : t("editor.publish")}
          </Button>
        </span>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col">
        {autosave.state === "conflict" && (
          <InlineAlert
            tone="declined"
            className="mb-6"
            title={t("editor.conflict")}
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => window.location.reload()}>
                {t("editor.reload")}
              </Button>
            }
          />
        )}

        <div className="flex items-start gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" aria-label={t("editor.changeIcon")} className={cn("flex size-[52px] shrink-0 items-center justify-center rounded-card", tile.chip)}>
                <Icon icon={hubIcon(draft.icon)} size="lg" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-4">
              <IconColorPicker icon={draft.icon} color={draft.color} onChange={(next) => change(next)} />
            </PopoverContent>
          </Popover>
          <textarea
            autoFocus={!draft.title}
            rows={1}
            value={draft.title}
            aria-label={t("editor.title")}
            placeholder={t("manage.untitled")}
            onChange={(e) => change({ title: e.target.value })}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            className="min-w-0 flex-1 resize-none bg-transparent text-hub-doc-title text-primary outline-none placeholder:text-disabled"
          />
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <PropertyRow label={t("editor.section")}>
            <Select
              value={props.sectionId ?? undefined}
              onValueChange={(sectionId) => {
                const name = sections.find((s) => s.id === sectionId)?.name ?? null;
                setProps((p) => ({ ...p, sectionId, sectionName: name }));
                void saveProps({ sectionId });
              }}
            >
              <SelectTrigger aria-label={t("editor.section")} className="h-8 w-auto min-w-48 border-transparent bg-transparent hover:bg-mist">
                {/* The name comes with the page: the list of sections loads after the Select first renders, and the
                    trigger stayed blank (walk of 2026-11-12). */}
                <SelectValue placeholder={t("editor.chooseSection")}>{props.sectionName ?? undefined}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={cn("size-3 rounded-glyph", TAG_CLASSES[toTagColor(s.color)].bar)} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PropertyRow>
          <PropertyRow label={t("editor.owner")}>
            <HubPeopleField
              single
              withRoles={false}
              ariaLabel={t("editor.owner")}
              value={{ userIds: props.owner ? [props.owner.id] : [], roleIds: [] }}
              onChange={(next) => {
                const ownerUserId = next.userIds[next.userIds.length - 1] ?? null;
                if (!ownerUserId) return;
                setProps((p) => ({ ...p, owner: p.owner && p.owner.id === ownerUserId ? p.owner : { id: ownerUserId, name: "", jobTitle: null, avatarUrl: null } }));
                void saveProps({ ownerUserId });
              }}
            />
          </PropertyRow>
          <PropertyRow label={t("editor.whoSees")}>
            <button
              type="button"
              onClick={() => setAudienceOpen(true)}
              className="flex h-8 w-fit max-w-full items-center gap-2 rounded-control border border-field bg-card px-3 text-body text-primary hover:border-strong"
            >
              <Icon icon={UserGroupIcon} size="sm" className="shrink-0 text-tertiary" />
              <span className="truncate">{audienceLabel(props.audienceLabel)}</span>
              <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
            </button>
          </PropertyRow>
          <PropertyRow label={t("editor.mustRead")} htmlFor="hub-must-read">
            <label className="flex items-center gap-2 text-body text-secondary">
              <Switch id="hub-must-read" checked={draft.mustRead} onCheckedChange={(mustRead) => change({ mustRead })} />
              {t("editor.mustReadHint")}
            </label>
          </PropertyRow>
          {draft.mustRead && (
            <div className="ml-[158px] flex items-center gap-3 rounded-card bg-mist px-4 py-3.5">
              <span className="text-label text-secondary">{t("editor.agreeBy")}</span>
              <div className="w-[180px]">
                <DatePicker value={draft.agreeBy ?? ""} onChange={(v) => change({ agreeBy: v || null })} ariaLabel={t("editor.agreeBy")} clearable />
              </div>
            </div>
          )}
          <p className="ml-[158px] text-hint text-tertiary">{t("editor.mustReadOffHint")}</p>
        </div>

        <hr className="my-6 border-divider" />

        <PageBodyEditor body={draft.body} onChange={(body) => change({ body })} excludePageId={page.id} />
      </div>

      <AudienceDialog
        open={audienceOpen}
        onOpenChange={setAudienceOpen}
        subject="page"
        value={props.audience}
        onApply={(audience, resolved) => {
          setProps((p) => ({ ...p, audience, audienceLabel: resolved?.label ?? (audience.mode === "EVERYONE" ? "EVERYONE" : String(resolved?.total ?? "")) }));
          void saveProps({ audience });
        }}
      />
      <PublishPageDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        nextVersion={nextVersion}
        firstPublish={!everPublished}
        mustRead={draft.mustRead}
        everAgreed={page.everAgreed}
        draftAgreeBy={draft.agreeBy}
        onPublish={publish}
      />
    </div>
  );
};

/** CM06, the page editor: the editor bar, the icon and title, the properties, and the block editor. */
export const PageEditorContainer: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations("hub");
  const page = usePageEdit(id);
  if (page.isLoading) {
    return (
      <div className="mx-auto mt-16 flex w-full max-w-[720px] flex-col gap-4">
        <div className="flex justify-center">
          <NodRing />
        </div>
        <Skeleton className="h-11 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (page.isError || !page.data) {
    return <HubReadError error={page.error} back={{ href: "/hub/manage/pages", label: t("manage.tabs.pages") }} onRetry={() => void page.refetch()} />;
  }
  return <Editor key={page.data.id} page={page.data} />;
};
