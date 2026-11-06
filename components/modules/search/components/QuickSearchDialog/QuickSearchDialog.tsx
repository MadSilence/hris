"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, FileTextIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/desact/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/desact/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { AccountStatusBadge, UserStatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { NoResults } from "@/components/feedback/EmptyState";
import { useAccess } from "@/components/auth";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { MIN_SEARCH_LENGTH, QUICK_SEARCH_LIMIT, useGlobalSearch } from "@/components/modules/search/hooks";
import {
  buildSearchPages,
  matchSearchPages,
  SEARCH_KIND_LABELS,
  searchItemHref,
  type SearchPage,
} from "@/components/modules/search/utils";
import { isActiveStatus } from "@/models/user/status";
import type { SearchGroup, SearchItem, SearchKind } from "@/models/search";
import { NodRing } from "@/components/desact/nod";

const DEBOUNCE_MS = 200;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The app's own destinations, as the sidebar offers them to this reader. */
  appPages: SearchPage[];
};

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").toUpperCase().slice(0, 2) || "?";

/**
 * The quick-search window (`HOME_AND_SEARCH.md` § 6, H11: there is no results page). It opens
 * from the sidebar's Search item and from Ctrl/Cmd + K, shows the best five of each kind the reader
 * may search, and "Show More" widens one kind in place.
 *
 * Built from the vendored command kit's parts rather than its `CommandDialog`, which cannot turn off
 * cmdk's own filtering: the server has already chosen and ordered the hits, and a second, client-side
 * fuzzy filter over them would reorder and drop what the reader was promised.
 *
 * Nothing here writes, so nothing is journalled. Which kinds appear is the server's answer; the pages
 * index is the only thing decided here, and only as UX — the page itself refuses whoever it refuses.
 */
export const QuickSearchDialog: React.FC<Props> = ({ open, onOpenChange, appPages }) => {
  const [term, setTerm] = useState("");
  const [expanded, setExpanded] = useState<SearchKind[]>([]);
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const router = useRouter();
  const { access } = useAccess();
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const tSettings = useTranslations("settings");

  const debounced = useDebouncedValue(term, DEBOUNCE_MS);
  const search = useGlobalSearch(debounced, expanded);

  const allPages = useMemo(
    () =>
      buildSearchPages(appPages, access, {
        label: (key) => tSettings(key),
        section: (group) => t("pages.settingsSection", { group }),
      }),
    [appPages, access, t, tSettings],
  );
  const pages = useMemo(() => matchSearchPages(allPages, term), [allPages, term]);

  const reset = () => {
    setTerm("");
    setExpanded([]);
    setPagesExpanded(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const go = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const handleTermChange = (value: string) => {
    setTerm(value);
    // A new term is a new question; what was widened for the last one is not widened for this one.
    setExpanded([]);
    setPagesExpanded(false);
  };

  const searching = debounced.trim().length >= MIN_SEARCH_LENGTH;
  const visiblePages = searching && !pagesExpanded ? pages.slice(0, QUICK_SEARCH_LIMIT) : pages;
  const hasServerHits = search.groups.some((group) => group.items.length > 0);

  const renderGroup = (group: SearchGroup) => {
    if (group.items.length === 0) return null;
    const canShowMore = !expanded.includes(group.kind) && group.items.length < group.total;

    return (
      <CommandGroup key={group.kind} heading={t(SEARCH_KIND_LABELS[group.kind])}>
        {group.items.map((item) => {
          const href = searchItemHref(group.kind, item);
          return (
            <CommandItem
              key={`${group.kind}:${item.id}`}
              value={`${group.kind}:${item.id}`}
              disabled={!href}
              onSelect={() => href && go(href)}
            >
              {group.kind === "PEOPLE" ? <PersonHit item={item}/> : <EntityHit item={item}/>}
            </CommandItem>
          );
        })}

        {canShowMore ? (
          <CommandItem
            value={`more:${group.kind}`}
            onSelect={() => setExpanded((current) => [...current, group.kind])}
            className="text-tertiary"
          >
            <Icon icon={ArrowDown01Icon} aria-hidden />
            <span>{tCommon("actions.showMore")}</span>
            <span className="ml-auto text-hint">
              {group.truncated ? `${group.total}+` : group.total}
            </span>
          </CommandItem>
        ) : null}

        {search.isExpanding(group.kind) ? (
          <div className="flex justify-center px-2 py-1.5"><NodRing size="sm" /></div>
        ) : null}
      </CommandGroup>
    );
  };

  const renderPages = (heading: string) =>
    visiblePages.length > 0 ? (
      <CommandGroup heading={heading}>
        {visiblePages.map((page) => (
          <CommandItem key={page.href} value={`page:${page.href}`} onSelect={() => go(page.href)}>
            <Icon icon={FileTextIcon} aria-hidden />
            <span className="truncate">{page.label}</span>
            {page.section ? (
              <span className="ml-auto truncate text-hint text-tertiary">{page.section}</span>
            ) : null}
          </CommandItem>
        ))}
        {searching && !pagesExpanded && pages.length > visiblePages.length ? (
          <CommandItem value="more:pages" onSelect={() => setPagesExpanded(true)} className="text-tertiary">
            <Icon icon={ArrowDown01Icon} aria-hidden />
            <span>{tCommon("actions.showMore")}</span>
            <span className="ml-auto text-hint">{pages.length}</span>
          </CommandItem>
        ) : null}
      </CommandGroup>
    ) : null;

  const renderResults = () => {
    if (!searching) return renderPages(t("pages.goTo"));
    if (search.error) {
      return <ErrorState error={search.error} compact onRetry={() => void search.refetch()}/>;
    }
    if (search.isLoading) {
      return <div role="status" className="px-4 py-6 text-center text-body text-tertiary">{t("dialog.searching")}</div>;
    }
    if (!hasServerHits && visiblePages.length === 0) {
      return <NoResults hint={t("dialog.noResultsHint")}/>;
    }
    return (
      <>
        {search.groups.map(renderGroup)}
        {renderPages(t("pages.heading"))}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* SPEC § 16: the command palette is a 560 px dialog near the top, not centred — it grows downwards as results come. */}
      <DialogContent hideClose className="top-[12vh] translate-y-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogTitle className="sr-only">{t("dialog.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("dialog.description")}
        </DialogDescription>
        <Command
          shouldFilter={false}
          loop
          className="[&_[cmdk-group-heading]]:text-tertiary **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2"
        >
          <CommandInput value={term} onValueChange={handleTermChange} placeholder={t("dialog.title")} inputMode="search"/>
          <CommandList className="max-h-[min(420px,60vh)]">
            {renderResults()}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const PersonHit: React.FC<{ item: SearchItem }> = ({ item }) => (
  <>
    <Avatar className="size-7 shrink-0">
      <AvatarImage src={item.avatarUrl ?? undefined} alt=""/>
      <AvatarFallback className="text-hint font-semibold">{initials(item.title)}</AvatarFallback>
    </Avatar>
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{item.title}</span>
      {item.subtitle ? <span className="truncate text-hint text-tertiary">{item.subtitle}</span> : null}
    </span>
    {/* An active colleague needs no chip — every hit would carry one. Leavers and starters do (H9). */}
    <span className="ml-auto flex shrink-0 gap-1">
      {item.status && !isActiveStatus(item.status) ? <UserStatusBadge status={item.status}/> : null}
      <AccountStatusBadge accountStatus={item.accountStatus}/>
    </span>
  </>
);

const EntityHit: React.FC<{ item: SearchItem }> = ({ item }) => (
  <span className="flex min-w-0 flex-1 items-baseline gap-2">
    <span className="truncate">{item.title}</span>
    {item.subtitle ? <span className="ml-auto truncate text-hint text-tertiary">{item.subtitle}</span> : null}
  </span>
);
