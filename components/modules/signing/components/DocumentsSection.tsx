"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Cancel01Icon, File01Icon, HourglassIcon, SignatureIcon, UserIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchBox } from "@/components/ui/SearchBox";
import { FilterChip } from "@/components/ui/FilterChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { PreviewDocumentModal } from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PreviewDocumentModal";
import { documentService } from "@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentService";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import { useDateFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import type { EnvelopeDTO, SectionSort } from "@/api/modules/signing/dto";
import {
  type SectionFilters,
  useSectionCounts,
  useSectionDocuments,
  useSectionExpiring,
  useSectionRequests,
  useSectionSignings,
} from "../hooks/useDocumentsSection";
import { useInvalidateSigning } from "../hooks/useSigning";
import { SigningPanel } from "./SigningPanel";
import { RequestDocumentsDialog } from "./RequestDocumentsDialog";

type View = "all" | "expiring" | "signing" | "requests";

const DAY = 86_400_000;
const daysFromToday = (iso: string) => Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY);

/**
 * The **Documents** item (documents-section D01–D06): everyone's documents the reader may see — all of them, what is
 * expiring, what is out for signature and whose turn it is, which requests are open. Only Person and Category filter
 * them. Only for those who manage other people's documents; the sidebar hides the item from everybody else.
 */
export function DocumentsSection({ initialView }: { initialView: View }) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [view, setView] = React.useState<View>(initialView);
  const [q, setQ] = React.useState("");
  const [person, setPerson] = React.useState<PickedUser | null>(null);
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<{ by: SectionSort; asc: boolean }>({ by: "UPLOADED", asc: false });
  const [preview, setPreview] = React.useState<DocumentDTO | null>(null);
  const [signing, setSigning] = React.useState<EnvelopeDTO | null>(null);
  const [asking, setAsking] = React.useState<{ document: DocumentDTO; personId: string; personName: string } | null>(null);
  const invalidate = useInvalidateSigning();

  const filters: SectionFilters = React.useMemo(
    () => ({ q, personIds: person ? [person.id] : [], categoryIds }),
    [q, person, categoryIds],
  );
  const counts = useSectionCounts();
  const categories = useDocumentCategories();
  const documents = useSectionDocuments(filters, sort.by, sort.asc);
  const signings = useSectionSignings(filters, view === "signing");
  const requests = useSectionRequests(view === "requests");
  const expiring = useSectionExpiring(view === "expiring");

  // The view lives in the address (`?view=…`), so a link or Back lands on it.
  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.replaceState(null, "", url.toString());
  }, [view]);

  const filtered = q.trim() !== "" || person !== null || categoryIds.length > 0;
  const clearAll = () => {
    setQ("");
    setPerson(null);
    setCategoryIds([]);
  };
  const categoryName = (id: string | null) => (id ? categories.data?.find((c) => c.id === id)?.name ?? "" : "");

  const sortBy = (by: SectionSort) => setSort((s) => ({ by, asc: s.by === by ? !s.asc : by !== "UPLOADED" }));
  const head = (by: SectionSort, label: string) => (
    <TableHead>
      <button type="button" className="inline-flex items-center gap-1" onClick={() => sortBy(by)}>
        {label}
        {sort.by === by && <span aria-hidden>{sort.asc ? "↑" : "↓"}</span>}
      </button>
    </TableHead>
  );

  const expiresCell = (iso: string | null | undefined, state: string | null | undefined) => {
    if (!iso) return <span className="text-tertiary">—</span>;
    const tone =
      state === "EXPIRED" ? "text-status-declined-text" : state === "EXPIRING" ? "text-status-pending-text" : "text-secondary";
    return (
      <span className={cn("inline-flex items-center gap-1 tabular-nums", tone)}>
        {state === "EXPIRED" && <Icon icon={Cancel01Icon} size="sm" />}
        {state === "EXPIRING" && <Icon icon={HourglassIcon} size="sm" />}
        {formatDate(iso, { style: "medium" })}
      </span>
    );
  };

  const empty = (title: string, body: string) =>
    filtered ? (
      <NoResults scene="no-match-s" title={t("section.empty.noMatch")} hint={t("section.empty.noMatchBody")}
                 action={<Button type="button" variant="secondary" onClick={clearAll}>{t("section.clearAll")}</Button>} />
    ) : (
      <EmptyState scene="documents" title={title} description={body} />
    );

  const body = (() => {
    if (view === "all") {
      if (documents.isError) return <ErrorState error={documents.error} title={t("section.error")} onRetry={() => void documents.refetch()} />;
      if (documents.isLoading) return <Rows />;
      const rows = documents.data?.pages.flatMap((p) => p.rows) ?? [];
      if (rows.length === 0) return empty(t("section.empty.all"), t("section.empty.allBody"));
      return (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {head("NAME", t("section.cols.name"))}
                {head("PERSON", t("section.cols.person"))}
                {head("CATEGORY", t("section.cols.category"))}
                {head("EXPIRES", t("section.cols.expires"))}
                <TableHead>{t("section.cols.whoCanSee")}</TableHead>
                {head("UPLOADED", t("section.cols.uploaded"))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.document.id} className="cursor-pointer" onClick={() => setPreview(r.document)}>
                  <TableCell>
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Icon icon={File01Icon} size="sm" className="shrink-0 text-tertiary" />
                      <span className="truncate font-medium" title={r.document.name}>{r.document.name}</span>
                      {r.document.signedAt && <Icon icon={SignatureIcon} size="sm" className="shrink-0 text-status-approved-text" />}
                    </span>
                  </TableCell>
                  <TableCell>{r.personName}</TableCell>
                  <TableCell>{r.document.categoryName ?? ""}</TableCell>
                  <TableCell>{expiresCell(r.document.expiresOn, r.document.expiryState)}</TableCell>
                  <TableCell className="text-secondary">
                    {r.document.visibility === "HR_ONLY" ? t("section.hidden") : t("section.visible")}
                  </TableCell>
                  <TableCell className="tabular-nums text-secondary">{formatDate(r.document.createdAt, { style: "medium" })}</TableCell>
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
      if (expiring.isError) return <ErrorState error={expiring.error} title={t("section.error")} onRetry={() => void expiring.refetch()} />;
      if (expiring.isLoading) return <Rows />;
      const rows = (expiring.data ?? []).filter(
        (r) =>
          (!person || r.personId === person.id) &&
          (categoryIds.length === 0 || (r.document.categoryId && categoryIds.includes(r.document.categoryId))) &&
          (!q.trim() || `${r.document.name} ${r.personName}`.toLowerCase().includes(q.trim().toLowerCase())),
      );
      if (rows.length === 0) return empty(t("section.empty.expiring"), t("section.empty.expiringBody"));
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("section.cols.name")}</TableHead>
              <TableHead>{t("section.cols.person")}</TableHead>
              <TableHead>{t("section.cols.category")}</TableHead>
              <TableHead>{t("section.cols.expires")}</TableHead>
              <TableHead>{t("section.cols.uploaded")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.document.id} className="group cursor-pointer" onClick={() => setPreview(r.document)}>
                <TableCell className="font-medium">{r.document.name}</TableCell>
                <TableCell>{r.personName}</TableCell>
                <TableCell>{r.document.categoryName ?? ""}</TableCell>
                <TableCell>{expiresCell(r.document.expiresOn, r.document.expiryState)}</TableCell>
                <TableCell className="tabular-nums text-secondary">{formatDate(r.document.createdAt, { style: "medium" })}</TableCell>
                <TableCell className="text-right">
                  {/* D02: on hover, ask for the new one (documents-requests R02). */}
                  <Button
                    type="button"
                    variant="link"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAsking({ document: r.document, personId: r.personId, personName: r.personName });
                    }}
                  >
                    {t("requests.newOne")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (view === "signing") {
      if (signings.isError) return <ErrorState error={signings.error} title={t("section.error")} onRetry={() => void signings.refetch()} />;
      if (signings.isLoading) return <Rows />;
      const rows = signings.data ?? [];
      if (rows.length === 0) return empty(t("section.empty.signing"), t("section.empty.signingBody"));
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("section.cols.document")}</TableHead>
              <TableHead>{t("section.cols.about")}</TableHead>
              <TableHead>{t("section.cols.waitingFor")}</TableHead>
              <TableHead>{t("section.cols.due")}</TableHead>
              <TableHead>{t("section.cols.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const e = r.envelope;
              const steps = [...new Set(e.signers.map((s) => s.order))].sort((a, b) => a - b);
              const turn = e.signers.find((s) => s.status === "PENDING");
              const days = daysFromToday(e.expiresAt);
              return (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setSigning(e)}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell>{r.personName}</TableCell>
                  <TableCell>
                    {e.status === "SENT" && turn ? (
                      <span className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5">
                          {turn.isGuest && <Icon icon={UserIcon} size="sm" className="text-tertiary" />}
                          {turn.name}
                        </span>
                        <span className="text-hint text-tertiary">
                          {turn.isGuest
                            ? t("section.guestStep", { n: steps.indexOf(turn.order) + 1, total: steps.length })
                            : t("section.step", { n: steps.indexOf(turn.order) + 1, total: steps.length })}
                        </span>
                      </span>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {e.status === "SENT" ? (
                      <span className="flex flex-col tabular-nums">
                        <span>{formatDate(e.expiresAt, { style: "medium" })}</span>
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
    if (requests.isError) return <ErrorState error={requests.error} title={t("section.error")} onRetry={() => void requests.refetch()} />;
    if (requests.isLoading) return <Rows />;
    const rows = (requests.data ?? []).filter(
      (r) =>
        (!person || r.personId === person.id) &&
        (categoryIds.length === 0 || (r.categoryId && categoryIds.includes(r.categoryId))) &&
        (!q.trim() || `${r.title} ${r.personName}`.toLowerCase().includes(q.trim().toLowerCase())),
    );
    if (rows.length === 0) return empty(t("section.empty.requests"), t("section.empty.requestsBody"));
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("section.cols.what")}</TableHead>
            <TableHead>{t("section.cols.whoUploads")}</TableHead>
            <TableHead>{t("section.cols.askedBy")}</TableHead>
            <TableHead>{t("section.cols.due")}</TableHead>
            <TableHead>{t("section.cols.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.taskId}>
              <TableCell>
                <Link href={`/organization/people/${r.personId}/documents`} className="font-medium hover:underline">
                  {t("section.upload", { what: r.title })}
                </Link>
                <span className="block text-hint text-tertiary">{r.personName}</span>
              </TableCell>
              <TableCell>{r.uploaderName ?? r.personName}</TableCell>
              <TableCell>{r.askedByName ?? "—"}</TableCell>
              <TableCell className="tabular-nums">{r.dueDate ? formatDate(r.dueDate, { style: "medium" }) : "—"}</TableCell>
              <TableCell>
                <StatusBadge size="sm" status={r.status === "UPLOADED" ? "approved" : r.status === "OVERDUE" ? "pending" : "inactive"}
                             label={t(`section.requestStatus.${r.status}`)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  })();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-page-title text-primary">{t("section.title")}</h1>
        <p className="mt-1 text-body text-secondary">{t("section.subtitle")}</p>
      </div>
      <SegmentedControl
        options={[
          { value: "all", label: `${t("section.views.all")} ${counts.data?.all ?? ""}`.trim() },
          { value: "expiring", label: `${t("section.views.expiring")} ${counts.data?.expiring ?? ""}`.trim() },
          { value: "signing", label: `${t("section.views.signing")} ${counts.data?.signing ?? ""}`.trim() },
          { value: "requests", label: `${t("section.views.requests")} ${counts.data?.requests ?? ""}`.trim() },
        ]}
        value={view}
        onChange={(v) => setView(v)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64">
          <SearchBox value={q} onChange={setQ} />
        </div>
        <div className="w-56">
          <UserPickerField value={person} onChange={setPerson} placeholder={t("section.person")} allowClear />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FilterChip withArrow selected={categoryIds.length > 0}>
              {categoryIds.length === 0
                ? t("section.category")
                : `${t("section.category")}: ${categoryName(categoryIds[0])}${categoryIds.length > 1 ? ` +${categoryIds.length - 1}` : ""}`}
            </FilterChip>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(categories.data ?? []).map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={categoryIds.includes(c.id)}
                onCheckedChange={(on) =>
                  setCategoryIds((ids) => (on ? [...ids, c.id] : ids.filter((id) => id !== c.id)))
                }
              >
                {c.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {filtered && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            {t("section.clearAll")}
          </Button>
        )}
      </div>
      {person && (
        <div className="flex items-center justify-between rounded-card border border-divider bg-card px-4 py-3">
          <span className="text-body font-medium text-primary">
            {`${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() || person.email}
          </span>
          <Button asChild variant="link">
            <Link href={`/organization/people/${person.id}/documents`}>{t("section.openProfile")} →</Link>
          </Button>
        </div>
      )}
      {body}

      <PreviewDocumentModal
        isOpen={!!preview}
        document={preview}
        getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
        fetchDocument={documentService.fetchPersonalDocument}
        onCloseAction={() => setPreview(null)}
      />
      {asking && (
        <RequestDocumentsDialog
          open
          person={{ id: asking.personId, name: asking.personName }}
          documents={[]}
          replacing={asking.document}
          onCloseAction={() => setAsking(null)}
          onSentAction={() => {
            setAsking(null);
            void invalidate();
          }}
        />
      )}
      <Dialog open={!!signing} onOpenChange={(next) => !next && setSigning(null)}>
        <DialogContent size="sm">
          <DialogTitle className="sr-only">{signing?.title ?? ""}</DialogTitle>
          {signing && (
            <SigningPanel
              envelope={signing}
              canSend
              onChangedAction={() => {
                setSigning(null);
                void invalidate();
              }}
              onSendAgainAction={() => setSigning(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Rows() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
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
