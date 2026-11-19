"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Alert02Icon, ArrowDown01Icon, PencilEdit02Icon, Tick02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { InlineAlert } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Skeleton } from "@/components/desact/skeleton";
import { Switch } from "@/components/desact/switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { dateToISO } from "@/lib/date";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DraftWrite, HubAudience, PageEdit, PublishRequest } from "@/models/hub";
import { publishHubPageAction, saveHubPageDraftAction, updateHubPagePropsAction } from "../../actions";
import { PageBodyEditor } from "../../document";
import { HubActionError, hubQueryKeys, unwrapHub, useAudienceResolve, useInvalidateHub, usePageEdit, usePageTree } from "../../hooks";
import { BackLink, HubReadError, hubIcon, LoadingBlock, PersonAvatar, useAudienceLabel, useHubDates } from "../../shared";
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

const PropertyRow: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string; className?: string }> = ({
  label,
  children,
  htmlFor,
  className,
}) => (
  <div className={cn("grid min-h-9 grid-cols-[150px_minmax(0,1fr)] items-center gap-2", className)}>
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
  const sectionColor = sections.find((s) => s.id === props.sectionId)?.color ?? null;
  const [sectionOpen, setSectionOpen] = React.useState(false);
  const [ownerOpen, setOwnerOpen] = React.useState(false);
  // A newly picked owner arrives as an id; the name comes from the audience resolver, as one person.
  const ownerResolve = useAudienceResolve(
    { mode: "PEOPLE", filters: [], userIds: props.owner ? [props.owner.id] : [], roleIds: [] },
    "",
    Boolean(props.owner && !props.owner.name),
  );
  const owner = props.owner?.name ? props.owner : (ownerResolve.data?.people.find((p) => p.id === props.owner?.id) ?? props.owner);

  return (
    // Page padding 24 48 32; the editor bar 36 high at the top; the column left-aligned, 720 (FIXES M1, M2).
    <div className="-mt-2 flex flex-col xl:px-4">
      <div className="sticky top-0 z-20 flex h-9 items-center gap-1.5 bg-page">
        <BackLink href="/hub/manage/pages" label={t("manage.tabs.pages")} />
        {props.sectionName && (
          <>
            <span aria-hidden className="text-hint text-tertiary">
              /
            </span>
            <span className="truncate text-hint text-tertiary">{props.sectionName}</span>
          </>
        )}
        <span className="ml-auto flex items-center gap-3">
          {autosave.state === "saving" ? (
            <span className="text-hint text-tertiary">{t("editor.saving")}</span>
          ) : autosave.state === "error" ? (
            <span role="alert" className="inline-flex items-center gap-1 text-hint text-danger-text">
              <Icon icon={Alert02Icon} size="sm" />
              {t("editor.notSaved")}
            </span>
          ) : savedAt ? (
            <span className="text-hint text-tertiary">{t("editor.savedAt", { time: dates.time(savedAt) })}</span>
          ) : null}
          {unpublished && everPublished && (
            <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-status-inactive-bg px-2 text-hint font-semibold text-status-inactive-text">
              <Icon icon={PencilEdit02Icon} size="sm" className="size-3.5" />
              {t("editor.unpublishedChanges")}
            </span>
          )}
          <Button type="button" variant="secondary" onClick={() => void openPreview()}>
            {t("editor.preview")}
          </Button>
          {/* Nothing to publish, no Publish: it appears once the draft differs from what readers see (FIXES Q3). A
              conflict offers Reload in its alert instead. */}
          {unpublished && autosave.state !== "conflict" && (
            <Button type="button" onClick={() => setPublishOpen(true)}>
              {everPublished ? t("editor.publishVersion", { version: nextVersion }) : t("editor.publish")}
            </Button>
          )}
        </span>
      </div>

      <div className="mt-6 flex w-full max-w-[720px] flex-col">
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
              {/* The page's tag tint, the icon 28 in the tag's dark colour (FIXES M4). */}
              <button type="button" aria-label={t("editor.changeIcon")} className={cn("flex size-[52px] shrink-0 items-center justify-center rounded-card", tile.chip)}>
                <Icon icon={hubIcon(draft.icon)} size="lg" className="size-7" />
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

        {/* Title row → properties 28; the rows 2 apart (FIXES M5). */}
        <div className="mt-7 flex flex-col gap-0.5">
          <PropertyRow label={t("editor.section")}>
            {/* Plain inline: the colour square 18, the name, the chevron — no box; a click opens the list (FIXES M6). The
                name comes with the page, so it shows before the list of sections loads (walk of 2026-11-12). */}
            <Popover open={sectionOpen} onOpenChange={setSectionOpen}>
              <PopoverTrigger asChild>
                <button type="button" aria-label={t("editor.section")} className="flex h-8 w-fit max-w-full items-center gap-1.5 rounded-control text-body text-primary">
                  {props.sectionName ? (
                    <>
                      <span aria-hidden className={cn("size-[18px] shrink-0 rounded-tag", TAG_CLASSES[toTagColor(sectionColor)].chip)} />
                      <span className="truncate">{props.sectionName}</span>
                    </>
                  ) : (
                    <span className="truncate text-tertiary">{t("editor.chooseSection")}</span>
                  )}
                  <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="flex max-h-80 w-64 flex-col overflow-y-auto p-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="flex items-center gap-2 rounded-control px-2 py-1.5 text-left text-body text-primary hover:bg-subtle"
                    onClick={() => {
                      setSectionOpen(false);
                      if (s.id === props.sectionId) return;
                      setProps((p) => ({ ...p, sectionId: s.id, sectionName: s.name }));
                      void saveProps({ sectionId: s.id });
                    }}
                  >
                    <span aria-hidden className={cn("size-[18px] shrink-0 rounded-tag", TAG_CLASSES[toTagColor(s.color)].chip)} />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    {s.id === props.sectionId && <Icon icon={Tick02Icon} size="sm" className="shrink-0 text-accent" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </PropertyRow>
          <PropertyRow label={t("editor.owner")}>
            {/* Plain inline: the avatar 22 and the full name; a click opens the person picker (FIXES M7). */}
            <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
              <PopoverTrigger asChild>
                <button type="button" aria-label={t("editor.owner")} className="flex h-8 w-fit max-w-full items-center gap-2 rounded-control text-body text-primary">
                  {owner ? (
                    <>
                      <PersonAvatar person={owner} />
                      <span className="truncate">{owner.name}</span>
                    </>
                  ) : (
                    <span className="truncate text-tertiary">{t("editor.chooseOwner")}</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-2">
                <HubPeopleField
                  single
                  withRoles={false}
                  ariaLabel={t("editor.owner")}
                  value={{ userIds: props.owner ? [props.owner.id] : [], roleIds: [] }}
                  onChange={(next) => {
                    const ownerUserId = next.userIds[next.userIds.length - 1] ?? null;
                    if (!ownerUserId) return;
                    setOwnerOpen(false);
                    setProps((p) => ({ ...p, owner: p.owner && p.owner.id === ownerUserId ? p.owner : { id: ownerUserId, name: "", jobTitle: null, avatarUrl: null } }));
                    void saveProps({ ownerUserId });
                  }}
                />
              </PopoverContent>
            </Popover>
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
          {/* 40 high; 10 from the toggle to its words, Ink (FIXES M8). */}
          <PropertyRow label={t("editor.mustRead")} htmlFor="hub-must-read" className="min-h-10">
            <label className="flex items-center gap-2.5 text-body text-primary">
              <Switch id="hub-must-read" checked={draft.mustRead} onCheckedChange={(mustRead) => change({ mustRead })} />
              {t("editor.mustReadHint")}
            </label>
          </PropertyRow>
          {draft.mustRead && (
            // #F7F7F8, 60 high, radius 16, padding 14 16; the date 180 × 32 at the block's right end; no past day (M9, N4).
            <div className="ml-[158px] flex h-[60px] items-center gap-3 rounded-card bg-subtle px-4 py-3.5">
              <span className="text-label text-primary">{t("editor.agreeBy")}</span>
              <div className="ml-auto w-[180px]">
                <DatePicker
                  value={draft.agreeBy ?? ""}
                  onChange={(v) => change({ agreeBy: v || null })}
                  min={dateToISO(new Date())}
                  ariaLabel={t("editor.agreeBy")}
                  clearable
                  className="h-8 text-hub-small"
                />
              </div>
            </div>
          )}
          <p className="mt-2.5 ml-[158px] text-hint text-tertiary">{t("editor.mustReadOffHint")}</p>
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
    // The bar draws at once; the column waits with a ring, then a skeleton (FIXES U3).
    return (
      <div className="-mt-2 flex flex-col xl:px-4">
        <div className="flex h-9 items-center">
          <BackLink href="/hub/manage/pages" label={t("manage.tabs.pages")} />
        </div>
        <LoadingBlock
          className="mt-6 w-full max-w-[720px]"
          skeleton={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-11 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          }
        />
      </div>
    );
  }
  if (page.isError || !page.data) {
    return (
      <HubReadError
        error={page.error}
        title={t("editor.loadError")}
        back={{ href: "/hub/manage/pages", label: t("manage.tabs.pages") }}
        onRetry={() => void page.refetch()}
      />
    );
  }
  return <Editor key={page.data.id} page={page.data} />;
};
