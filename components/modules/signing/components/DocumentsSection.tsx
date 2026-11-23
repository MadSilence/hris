"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight01Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  FileImportIcon,
  HourglassIcon,
  SignatureIcon,
  StarIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { Label } from "@/components/desact/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchBox } from "@/components/ui/SearchBox";
import { FilterChip } from "@/components/ui/FilterChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TagChip } from "@/components/ui/TagChip";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PersonAvatar } from "@/components/modules/automations/shared";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { PreviewDocumentModal } from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PreviewDocumentModal";
import { documentService } from "@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentService";
import {
  starPersonalDocumentAction,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/starPersonalDocumentAction";
import {
  unstarPersonalDocumentAction,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/unstarPersonalDocumentAction";
import { useIsDemo } from "@/components/modules/demo";
import { useDateFormatter, useShortDates } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import type { EnvelopeDTO, SectionDocumentRow, SectionSort } from "@/api/modules/signing/dto";
import {
  type SectionFilters,
  useSectionCounts,
  useSectionDocuments,
  useSectionExpiring,
  useSectionFacets,
  useSectionRequests,
  useSectionSignings,
} from "../hooks/useDocumentsSection";
import { useInvalidateSigning } from "../hooks/useSigning";
import { CancelSigningButton, SigningPanel } from "./SigningPanel";
import { RequestDocumentsDialog } from "./RequestDocumentsDialog";
import { SendForSignatureDialog } from "./SendForSignatureDialog";
import { PickDocumentDialog } from "./PickDocumentDialog";
import { ExpiryCell } from "./ExpiryPieces";
import { DocumentName, FileTypeTile, SortHeader, ViewLabel, VisibilityCell, isRowClick } from "./DocumentPieces";
import { useQueryClient } from "@tanstack/react-query";

type View = "all" | "expiring" | "signing" | "requests";
const VIEWS: View[] = ["all", "expiring", "signing", "requests"];

const DAY = 86_400_000;
const daysFromToday = (iso: string) => Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY);

/* D01 (DS10b): the name takes the rest and cuts with …; every other column is as wide as drawn, gap included. */
const W = {
  check: "w-8",
  person: "w-[216px]",
  category: "w-[136px]",
  expires: "w-[156px]",
  visibility: "w-32",
  uploaded: "w-[120px]",
  actions: "w-24",
  action: "w-[200px]",
  due: "w-[136px]",
  status: "w-[168px]",
} as const;

/** A person in a cell (D01, D04): avatar 22 and the name, 14/18. */
function PersonCell({ name }: { name: string | null | undefined }) {
  if (!name) return <span className="text-tertiary">—</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <PersonAvatar name={name} size={22} />
      <span className="truncate text-body leading-[18px] text-primary">{name}</span>
    </span>
  );
}

/**
 * The **Documents** item (documents-section D01–D14): everyone's documents the reader may see — all of them, what is
 * expiring, what is out for signature and whose turn it is, which requests are open. Only Person and Category filter
 * them, and every view's count follows them (DS5). The view lives in the address (`?view=`), so Back, Forward and a
 * shared link land on it (DS4). Only for those who manage other people's documents; the sidebar hides the item from
 * everybody else.
 */
export function DocumentsSection({ initialView }: { initialView: View }) {
  const t = useTranslations("signing");
  const tOrg = useTranslations("organization");
  const tCommon = useTranslations("common");
  const formatDate = useDateFormatter();
  const dates = useShortDates();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams?.get("view");
  const view: View = VIEWS.includes(fromUrl as View) ? (fromUrl as View) : initialView;
  const setView = (next: View) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("view", next);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [q, setQ] = React.useState("");
  const [personIds, setPersonIds] = React.useState<string[]>([]);
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<{ by: SectionSort; asc: boolean }>({ by: "UPLOADED", asc: false });
  const [preview, setPreview] = React.useState<SectionDocumentRow | null>(null);
  const [signing, setSigning] = React.useState<EnvelopeDTO | null>(null);
  const [asking, setAsking] = React.useState<{ document: DocumentDTO | null; personId: string; personName: string; documents: DocumentDTO[] } | null>(null);
  const [pickingPerson, setPickingPerson] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const [sending, setSending] = React.useState<SectionDocumentRow | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const invalidate = useInvalidateSigning();
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();

  const filters: SectionFilters = React.useMemo(() => ({ q, personIds, categoryIds }), [q, personIds, categoryIds]);
  const counts = useSectionCounts(filters);
  const facets = useSectionFacets(personIds, categoryIds);
  const documents = useSectionDocuments(filters, sort.by, sort.asc);
  const signings = useSectionSignings(filters, view === "signing");
  const requests = useSectionRequests(filters, view === "requests");
  const expiring = useSectionExpiring(filters, view === "expiring");

  const filtered = q.trim() !== "" || personIds.length > 0 || categoryIds.length > 0;
  const clearAll = () => {
    setQ("");
    setPersonIds([]);
    setCategoryIds([]);
  };
  const people = facets.data?.people ?? [];
  const categories = facets.data?.categories ?? [];
  const personName = (id: string) => people.find((p) => p.id === id)?.name ?? "";
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const onePerson = personIds.length === 1 ? { id: personIds[0], name: personName(personIds[0]) } : null;

  const sortBy = (by: SectionSort) => setSort((s) => ({ by, asc: s.by === by ? !s.asc : by !== "UPLOADED" }));
  const head = (by: SectionSort, label: string, className?: string) => (
    <TableHead className={className}>
      <SortHeader label={label} active={sort.by === by} ascending={sort.asc} onClick={() => sortBy(by)} />
    </TableHead>
  );
  /** A header drawn as sorted, for a list the backend always orders one way (D02 Expires ↑, D03/D04 Due ↑). */
  const fixedHead = (label: string, className?: string) => (
    <TableHead className={className}>
      <span className="inline-flex items-center gap-1 text-primary">
        {label}
        <Icon icon={ArrowUp01Icon} size="sm" className="size-3.5" />
      </span>
    </TableHead>
  );

  const toggleStar = async (d: DocumentDTO) => {
    const r = d.isStarred ? await unstarPersonalDocumentAction({ documentId: d.id }) : await starPersonalDocumentAction({ documentId: d.id });
    if (r.status === "SUCCESS") void queryClient.invalidateQueries({ queryKey: ["SIGNING", "SECTION"] });
  };

  const askFor = (personId: string, name: string, document: DocumentDTO | null) => {
    const rows = documents.data?.pages.flatMap((p) => p.rows) ?? [];
    setAsking({ document, personId, personName: name, documents: rows.filter((r) => r.personId === personId).map((r) => r.document) });
  };
  // DS2: Request asks the picked person, or picks one first.
  const requestFromToolbar = () => {
    if (onePerson) askFor(onePerson.id, onePerson.name, null);
    else setPickingPerson(true);
  };

  const empty = (scene: "documents" | "signing" | "requests", title: string, body: string, action?: React.ReactNode) =>
    filtered ? (
      <NoResults
        scene="no-match-s"
        title={t("section.empty.noMatch")}
        hint={t("section.empty.noMatchBody")}
        action={<Button type="button" variant="secondary" onClick={clearAll}>{t("section.clearAll")}</Button>}
      />
    ) : (
      <EmptyState scene={scene} title={title} description={body} action={action} />
    );
  const failed = (error: unknown, retry: () => void) => (
    <ErrorState error={error} title={t("section.error")} message={t("section.errorBody")} onRetry={retry} />
  );

  const body = (() => {
    if (view === "all") {
      if (documents.isError) return failed(documents.error, () => void documents.refetch());
      const rows = documents.data?.pages.flatMap((p) => p.rows) ?? [];
      if (!documents.isLoading && rows.length === 0) return empty("documents", t("section.empty.all"), t("section.empty.allBody"));
      const ids = rows.map((r) => r.document.id);
      const picked = ids.filter((id) => selected.has(id));
      return (
        <>
          {picked.length > 0 && (
            <SelectionBar
              count={picked.length}
              onClear={() => setSelected(new Set())}
              actions={[{
                key: "download",
                label: tCommon("actions.download"),
                icon: Download01Icon,
                href: `/api/documents/batch/zip?${new URLSearchParams(picked.map((id) => ["ids", id])).toString()}`,
              }]}
            />
          )}
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className={W.check}>
                  <Checkbox
                    aria-label={tOrg("documents.table.selectAll")}
                    checked={ids.length > 0 && picked.length === ids.length ? true : picked.length > 0 ? "indeterminate" : false}
                    onCheckedChange={() => setSelected(picked.length === ids.length ? new Set() : new Set(ids))}
                  />
                </TableHead>
                {head("NAME", t("section.cols.name"))}
                {head("PERSON", t("section.cols.person"), W.person)}
                {head("CATEGORY", t("section.cols.category"), W.category)}
                {head("EXPIRES", t("section.cols.expires"), W.expires)}
                <TableHead className={W.visibility}>{t("section.cols.whoCanSee")}</TableHead>
                {head("UPLOADED", t("section.cols.uploaded"), W.uploaded)}
                <TableHead className={W.actions} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.isLoading ? <SkeletonRows /> : rows.map((r) => (
                <TableRow
                  key={r.document.id}
                  tabIndex={0}
                  data-state={selected.has(r.document.id) ? "selected" : undefined}
                  className="group/row h-12 cursor-pointer"
                  onClick={(e) => isRowClick(e) && setPreview(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) {
                      e.preventDefault();
                      setPreview(r);
                    }
                  }}
                >
                  <TableCell className={W.check} data-row-control>
                    <Checkbox
                      aria-label={tOrg("documents.table.select", { name: r.document.name })}
                      checked={selected.has(r.document.id)}
                      onCheckedChange={() =>
                        setSelected((s) => {
                          const next = new Set(s);
                          if (next.has(r.document.id)) next.delete(r.document.id);
                          else next.add(r.document.id);
                          return next;
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="flex min-w-0 items-center gap-3">
                      <FileTypeTile mimeType={r.document.mimeType} name={r.document.name} />
                      <DocumentName name={r.document.name} />
                      {r.document.signedAt && <Icon icon={SignatureIcon} size="sm" className="size-3.5 shrink-0 text-status-approved-icon" />}
                    </span>
                  </TableCell>
                  <TableCell><PersonCell name={r.personName} /></TableCell>
                  <TableCell>
                    {r.document.categoryName ? <TagChip color={null} size="sm">{r.document.categoryName}</TagChip> : <span className="text-tertiary">—</span>}
                  </TableCell>
                  <TableCell><ExpiryCell document={r.document} /></TableCell>
                  <TableCell>
                    <VisibilityCell hidden={r.document.visibility === "HR_ONLY"} label={r.document.visibility === "HR_ONLY" ? t("section.hidden") : t("section.visible")} />
                  </TableCell>
                  <TableCell className="tabular-nums text-tertiary">{formatDate(r.document.createdAt, { style: "medium" })}</TableCell>
                  <TableCell className="text-right" data-row-control>
                    <RowQuickActions
                      document={r.document}
                      onToggleStar={() => void toggleStar(r.document)}
                      onSend={r.document.mimeType === "application/pdf" && !r.document.signedAt ? () => setSending(r) : undefined}
                      onRequest={r.document.expiryState === "EXPIRING" || r.document.expiryState === "EXPIRED"
                        ? () => askFor(r.personId, r.personName, r.document)
                        : undefined}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documents.hasNextPage && (
            <InfiniteSentinel onReachAction={() => void documents.fetchNextPage()} busy={documents.isFetchingNextPage} label={t("section.loadMore")} />
          )}
        </>
      );
    }
    if (view === "expiring") {
      if (expiring.isError) return failed(expiring.error, () => void expiring.refetch());
      const rows = expiring.data ?? [];
      if (!expiring.isLoading && rows.length === 0) return empty("documents", t("section.empty.expiring"), t("section.empty.expiringBody"));
      return (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>{t("section.cols.name")}</TableHead>
              <TableHead className={W.person}>{t("section.cols.person")}</TableHead>
              <TableHead className={W.category}>{t("section.cols.category")}</TableHead>
              {fixedHead(t("section.cols.expires"), W.expires)}
              <TableHead className={W.uploaded}>{t("section.cols.uploaded")}</TableHead>
              <TableHead className={W.action} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiring.isLoading ? <SkeletonRows /> : rows.map((r) => (
              <TableRow
                key={r.document.id}
                tabIndex={0}
                className="group/row h-12 cursor-pointer"
                onClick={(e) => isRowClick(e) && setPreview(r)}
              >
                <TableCell>
                  <span className="flex min-w-0 items-center gap-3">
                    <FileTypeTile mimeType={r.document.mimeType} name={r.document.name} />
                    <DocumentName name={r.document.name} />
                  </span>
                </TableCell>
                <TableCell><PersonCell name={r.personName} /></TableCell>
                <TableCell>
                  {r.document.categoryName ? <TagChip color={null} size="sm">{r.document.categoryName}</TagChip> : <span className="text-tertiary">—</span>}
                </TableCell>
                <TableCell><ExpiryCell document={r.document} /></TableCell>
                <TableCell className="tabular-nums text-tertiary">{formatDate(r.document.createdAt, { style: "medium" })}</TableCell>
                <TableCell className="text-right" data-row-control>
                  {/* D02 (DS16): once asked, the row says so; until then, on hover, a secondary 32 button asks. */}
                  {r.askedOn ? (
                    <span className="inline-flex items-center gap-1.5 text-hint text-secondary">
                      <Icon icon={CheckmarkCircle02Icon} size="sm" className="size-3.5 text-status-approved-icon" />
                      {t("section.askedOn", { date: dates.date(r.askedOn) })}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover/row:opacity-100 touch:opacity-100 focus-visible:opacity-100"
                      onClick={() => askFor(r.personId, r.personName, r.document)}
                    >
                      {t("requests.newOne")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (view === "signing") {
      if (signings.isError) return failed(signings.error, () => void signings.refetch());
      const rows = signings.data ?? [];
      if (!signings.isLoading && rows.length === 0) {
        // D09b (DS14): nothing out — and the way to send one, through the document picker (D14).
        return empty("signing", t("section.empty.signing"), t("section.empty.signingBody"), (
          <Button type="button" variant="secondary" onClick={() => setPicking(true)}>
            <Icon icon={SignatureIcon} size="sm" />
            {t("menu.send")}
          </Button>
        ));
      }
      return (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>{t("section.cols.document")}</TableHead>
              <TableHead className={W.person}>{t("section.cols.about")}</TableHead>
              <TableHead className="w-[232px]">{t("section.cols.waitingFor")}</TableHead>
              {fixedHead(t("section.cols.due"), W.due)}
              <TableHead className={W.status}>{t("section.cols.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signings.isLoading ? <SkeletonRows /> : rows.map((r) => {
              const e = r.envelope;
              const steps = [...new Set(e.signers.map((s) => s.order))].sort((a, b) => a - b);
              const turn = e.signers.find((s) => s.status === "PENDING");
              const days = daysFromToday(e.expiresAt);
              return (
                <TableRow key={e.id} className="group/row h-14 cursor-pointer" onClick={(ev) => isRowClick(ev) && setSigning(e)}>
                  <TableCell>
                    <span className="flex min-w-0 items-center gap-3">
                      <FileTypeTile mimeType="application/pdf" name={e.title} />
                      <DocumentName name={e.title} />
                    </span>
                  </TableCell>
                  <TableCell><PersonCell name={r.personName} /></TableCell>
                  <TableCell>
                    {e.status === "SENT" && turn ? (
                      <span className="flex min-w-0 items-center gap-2">
                        {turn.isGuest ? (
                          <span className="grid size-[22px] flex-none place-items-center rounded-pill bg-mist text-secondary">
                            <Icon icon={UserIcon} size="sm" className="size-3" />
                          </span>
                        ) : (
                          <PersonAvatar name={turn.name} size={22} />
                        )}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-body leading-[18px] text-primary">{turn.name}</span>
                          <span className="text-hint text-tertiary">
                            {turn.isGuest
                              ? t("section.guestStep", { n: steps.indexOf(turn.order) + 1, total: steps.length })
                              : t("section.step", { n: steps.indexOf(turn.order) + 1, total: steps.length })}
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {e.status === "SENT" ? (
                      <span className="flex flex-col tabular-nums">
                        <span className="text-body text-primary">{dates.date(e.expiresAt)}</span>
                        <span className={cn("text-hint", days < 0 ? "text-status-declined-text" : days <= 3 ? "text-status-pending-text" : "text-tertiary")}>
                          {days < 0 ? t("section.daysAgo", { count: -days }) : t("section.inDays", { count: days })}
                        </span>
                      </span>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge size="sm" status={e.status === "SENT" ? "in-progress" : "declined"}
                                 label={t(`section.signingStatus.${e.status === "SENT" ? "SENT" : e.status === "EXPIRED" ? "EXPIRED" : "DECLINED"}`)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }
    if (requests.isError) return failed(requests.error, () => void requests.refetch());
    const rows = requests.data ?? [];
    if (!requests.isLoading && rows.length === 0) {
      // D09c (DS14): no open requests — and Request, the same flow as the toolbar's.
      return empty("requests", t("section.empty.requests"), t("section.empty.requestsBody"), (
        <Button type="button" variant="secondary" onClick={requestFromToolbar}>
          <Icon icon={FileImportIcon} size="sm" />
          {t("section.request")}
        </Button>
      ));
    }
    return (
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>{t("section.cols.what")}</TableHead>
            <TableHead className={W.person}>{t("section.cols.whoUploads")}</TableHead>
            <TableHead className={W.person}>{t("section.cols.askedBy")}</TableHead>
            {fixedHead(t("section.cols.due"), W.due)}
            <TableHead className="w-32">{t("section.cols.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.isLoading ? <SkeletonRows /> : rows.map((r) => {
            const days = r.dueDate ? daysFromToday(r.dueDate) : null;
            return (
              <TableRow key={r.taskId} className="group/row h-14 cursor-pointer" onClick={(e) => isRowClick(e) && router.push(`/organization/people/${r.personId}/documents`)}>
                <TableCell>
                  {/* D04 (DS17): the request tile, and "Upload: Passport" on one line. */}
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-7 flex-none place-items-center rounded-control bg-accent-subtle text-accent-text">
                      <Icon icon={FileImportIcon} size="sm" />
                    </span>
                    <DocumentName name={t("section.upload", { what: r.title.replace(/\.[^.]+$/, "") })} />
                  </span>
                </TableCell>
                <TableCell><PersonCell name={r.uploaderName ?? r.personName} /></TableCell>
                <TableCell><PersonCell name={r.askedByName} /></TableCell>
                <TableCell>
                  {r.dueDate && days !== null ? (
                    <span className="flex flex-col tabular-nums">
                      <span className="text-body text-primary">{dates.date(r.dueDate)}</span>
                      {r.status !== "UPLOADED" && (
                        <span className={cn("text-hint", days < 0 ? "text-status-pending-text" : "text-tertiary")}>
                          {days < 0 ? t("section.daysAgo", { count: -days }) : t("section.inDays", { count: days })}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-tertiary">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge size="sm" status={r.status === "UPLOADED" ? "approved" : r.status === "OVERDUE" ? "pending" : "inactive"}
                               label={t(`section.requestStatus.${r.status}`)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-primary">{t("section.title")}</h1>
        <p className="text-body text-secondary">{t("section.subtitle")}</p>
      </div>
      {/* D01 (DS1): the switch as wide as its labels; three views with their icons; every count in its pill, kept while
          a list loads or fails. */}
      <SegmentedControl
        aria-label={t("section.title")}
        fill={false}
        size="window"
        className="self-start"
        options={[
          { value: "all", label: <ViewLabel label={t("section.views.all")} count={counts.data?.all} /> },
          { value: "expiring", label: <ViewLabel icon={HourglassIcon} label={t("section.views.expiring")} count={counts.data?.expiring} /> },
          { value: "signing", label: <ViewLabel icon={SignatureIcon} label={t("section.views.signing")} count={counts.data?.signing} /> },
          { value: "requests", label: <ViewLabel icon={FileImportIcon} label={t("section.views.requests")} count={counts.data?.requests} /> },
        ]}
        value={view}
        onChange={(v) => setView(v)}
      />
      {/* DS2: Search · Person · Category, Clear all; Request on the right. */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} aria-label={t("section.search")} className="w-[260px]" size="md" />
        <FacetChip
          label={t("section.person")}
          selected={personIds}
          nameOf={personName}
          options={people}
          onChange={setPersonIds}
        />
        {/* DS15: a company with no categories is not offered the filter. */}
        {categories.length > 0 || categoryIds.length > 0 ? (
          <FacetChip
            label={t("section.category")}
            selected={categoryIds}
            nameOf={categoryName}
            options={categories}
            onChange={setCategoryIds}
          />
        ) : null}
        {filtered && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            {t("section.clearAll")}
          </Button>
        )}
        <Button type="button" variant="secondary" className="ml-auto" onClick={requestFromToolbar}>
          <Icon icon={FileImportIcon} size="sm" />
          {t("section.request")}
        </Button>
      </div>
      {/* D06 (DS9): one person picked — a quiet strip with Open profile right after the name. */}
      {onePerson && (
        <div className="-mb-2 flex items-center gap-2.5 rounded-card bg-subtle px-3.5 py-2.5">
          <PersonAvatar name={onePerson.name} size={22} />
          <span className="text-body font-semibold text-primary">{onePerson.name}</span>
          <Button asChild variant="ghost" size="sm" className="text-accent-text">
            <Link href={`/organization/people/${onePerson.id}/documents`}>
              {t("section.openProfile")}
              <Icon icon={ArrowRight01Icon} size="sm" className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}
      {body}

      <PreviewDocumentModal
        isOpen={!!preview}
        document={preview?.document ?? null}
        getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
        fetchDocument={documentService.fetchPersonalDocument}
        onCloseAction={() => setPreview(null)}
        personFirstName={preview?.personName?.split(" ")[0] ?? null}
      />
      {asking && (
        <RequestDocumentsDialog
          open
          person={{ id: asking.personId, name: asking.personName }}
          documents={asking.documents}
          replacing={asking.document}
          onCloseAction={() => setAsking(null)}
          onSentAction={() => {
            setAsking(null);
            void invalidate();
          }}
        />
      )}
      {pickingPerson && (
        <PickPersonDialog
          onCloseAction={() => setPickingPerson(false)}
          onNextAction={(user) => {
            setPickingPerson(false);
            const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "";
            askFor(user.id, name, null);
          }}
        />
      )}
      {picking && (
        <PickDocumentDialog
          onCloseAction={() => setPicking(false)}
          onNextAction={(row) => {
            setPicking(false);
            setSending(row);
          }}
        />
      )}
      {sending && (
        <SendForSignatureDialog
          open
          documentId={sending.document.id}
          fileName={sending.document.name}
          person={{ id: sending.personId, name: sending.personName }}
          manager={null}
          demo={isDemo}
          onCloseAction={() => setSending(null)}
          onSentAction={() => {
            setSending(null);
            void invalidate();
          }}
        />
      )}
      <Dialog open={!!signing} onOpenChange={(next) => !next && setSigning(null)}>
        <DialogContent size="sm">
          <DialogTitle className="sr-only">{signing?.title ?? ""}</DialogTitle>
          {signing && (
            <>
              <SigningPanel
                envelope={signing}
                canSend
                cancelInFooter={signing.status === "SENT"}
                onChangedAction={() => {
                  setSigning(null);
                  void invalidate();
                }}
                onSendAgainAction={() => setSigning(null)}
              />
              {signing.status === "SENT" && (
                <DialogFooter>
                  <CancelSigningButton
                    envelope={signing}
                    onDoneAction={() => {
                      setSigning(null);
                      void invalidate();
                    }}
                  />
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Download, Star and ⋯ at a row's end (D01); Download and Star show on hover, always on touch, and are not copied into ⋯ (U11). */
function RowQuickActions({
  document,
  onToggleStar,
  onSend,
  onRequest,
}: {
  document: DocumentDTO;
  onToggleStar: () => void;
  onSend?: () => void;
  onRequest?: () => void;
}) {
  const t = useTranslations("signing");
  const tOrg = useTranslations("organization");
  const tCommon = useTranslations("common");
  const url = documentService.getPersonalDocumentDownloadUrl(document.id);
  return (
    <div className="flex items-center justify-end gap-0.5">
      <a
        href={url}
        download
        aria-label={tCommon("actions.download")}
        title={tCommon("actions.download")}
        className="inline-flex size-8 items-center justify-center rounded-control text-secondary opacity-0 hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100 touch:opacity-100"
      >
        <Icon icon={Download01Icon} size="sm" />
      </a>
      <button
        type="button"
        onClick={onToggleStar}
        aria-pressed={document.isStarred}
        aria-label={document.isStarred ? tOrg("documents.table.unstar") : tOrg("documents.table.star")}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-control hover:bg-mist focus-visible:opacity-100 group-hover/row:opacity-100 touch:opacity-100",
          !document.isStarred && "opacity-0",
        )}
      >
        <Icon icon={StarIcon} size="sm" className={document.isStarred ? "fill-current text-status-pending-icon" : "text-secondary"} />
      </button>
      {/* Download is the row's own hover action, always visible on touch — never copied in here (U11). */}
      {onSend || onRequest ? (
      <RowActionsMenu label={tOrg("documents.table.actions")} stopPropagation>
        {onSend && (
          <RowAction icon={<Icon icon={SignatureIcon} size="sm" />} onClick={onSend}>
            {t("menu.send")}
          </RowAction>
        )}
        {onRequest && (
          <RowAction icon={<Icon icon={FileImportIcon} size="sm" />} onClick={onRequest}>
            {t("requests.newOne")}
          </RowAction>
        )}
      </RowActionsMenu>
      ) : null}
    </div>
  );
}

/**
 * A filter chip with its menu (D05, DS7, DS8): ticks and counts, only what has documents, no search row of its own.
 * Picked, the chip reads "Person: Meryem Alaoui", or "Category: Identity +3" on one line.
 */
function FacetChip({
  label,
  selected,
  nameOf,
  options,
  onChange,
}: {
  label: string;
  selected: string[];
  nameOf: (id: string) => string;
  options: { id: string; name: string; count: number }[];
  onChange: (ids: string[]) => void;
}) {
  const text = selected.length === 0
    ? label
    : `${label}: ${nameOf(selected[0])}${selected.length > 1 ? ` +${selected.length - 1}` : ""}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterChip withArrow selected={selected.length > 0} className="max-w-[280px]">
          <span className="truncate">{text}</span>
        </FilterChip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-[240px] overflow-y-auto">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={selected.includes(o.id)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(on) => onChange(on ? [...selected, o.id] : selected.filter((id) => id !== o.id))}
          >
            <span className="min-w-0 flex-1 truncate">{o.name}</span>
            <span className="ml-3 text-hint tabular-nums text-tertiary">{o.count.toLocaleString()}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Request from the toolbar with nobody picked (DS2): whom to ask, first. */
function PickPersonDialog({ onCloseAction, onNextAction }: { onCloseAction: () => void; onNextAction: (user: PickedUser) => void }) {
  const t = useTranslations("signing");
  const [user, setUser] = React.useState<PickedUser | null>(null);
  return (
    <Dialog open onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("requests.documents")}</DialogTitle>
          <DialogDescription>{t("section.pickPerson")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label>{t("section.person")}</Label>
          <UserPickerField value={user} onChange={setUser} />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction}>
            {t("requests.cancel")}
          </Button>
          {user && (
            <Button type="button" onClick={() => onNextAction(user)}>
              {t("pick.next")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** D11 (DS13): the header stays; each row is skeleton per cell, with shimmer. */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i} className="h-12 hover:bg-transparent" aria-hidden>
          <TableCell colSpan={99}>
            <span className="flex items-center gap-4">
              <Skeleton className="size-4 rounded-glyph" />
              <Skeleton className="size-7 rounded-control" />
              <Skeleton className="h-2.5 w-48" />
              <span className="ml-auto flex items-center gap-4">
                <Skeleton className="size-[22px] rounded-pill" />
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-2.5 w-[72px]" />
                <Skeleton className="h-2.5 w-[90px]" />
                <Skeleton className="h-2.5 w-[70px]" />
                <Skeleton className="h-2.5 w-[76px]" />
              </span>
            </span>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/** The endless list's foot (PRODUCT-RULES § Lists): the next page loads when it scrolls into view. */
function InfiniteSentinel({ onReachAction, busy, label }: { onReachAction: () => void; busy: boolean; label: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && !busy && onReachAction());
    observer.observe(el);
    return () => observer.disconnect();
  }, [onReachAction, busy]);
  return (
    <div ref={ref} className="flex justify-center py-3">
      <Button type="button" variant="ghost" size="sm" loading={busy} onClick={onReachAction}>
        {label}
      </Button>
    </div>
  );
}
