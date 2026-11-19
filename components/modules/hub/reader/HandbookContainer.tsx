"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { useCanAccess } from "@/components/auth";
import type { HandbookSection } from "@/models/hub";
import { useHandbook } from "../hooks";
import { BackLink, HubAskBox, HubLoadError, HubPage, HubState, HubTitle, hubIcon, IconTile, LoadingBlock, TruncatedTitle, useCompanyName } from "../shared";

/** A section's first pages: those waiting for the reader first, then the editor's order (CP01). */
export const orderSectionPages = <T extends { waiting: boolean }>(pages: T[]): T[] => [
  ...pages.filter((p) => p.waiting),
  ...pages.filter((p) => !p.waiting),
];

/** One section on CP01 (`HandbookSection`): its header, a hairline, three pages and "{n} more" that opens in place. */
const SectionCardView: React.FC<{ section: HandbookSection }> = ({ section }) => {
  const t = useTranslations("hub");
  const [open, setOpen] = React.useState(false);
  const pages = orderSectionPages(section.pages);
  const shown = open ? pages : pages.slice(0, 3);
  const waits = section.toAgree > 0;
  return (
    // Mist #F7F7F8, padding 20 22 22, 14 from the tile to the name, the name 16/22 (FIXES E3).
    <section id={`section-${section.id}`} className="flex scroll-mt-6 flex-col rounded-panel bg-subtle px-5.5 pt-5 pb-5.5">
      <div className="flex items-start gap-3.5">
        <IconTile icon={hubIcon(section.icon)} color={section.color} size={40} dot={waits} />
        <div className="flex min-w-0 flex-col">
          <h2 className="line-clamp-2 text-hub-card text-primary">{section.name}</h2>
          <span className="text-hint text-tertiary">
            {t("handbook.pages", { count: section.pageCount })}
            {waits && <span className="font-medium text-accent">{t("handbook.toAgreeSuffix", { count: section.toAgree })}</span>}
          </span>
        </div>
      </div>
      {/* A hairline, 16, then rows 20 high and 12 apart, 10 from the icon to the title (FIXES E4). */}
      <ul className="mt-4 flex flex-col gap-3 border-t border-divider pt-4">
        {shown.map((page) => (
          <li key={page.id}>
            <Link href={`/hub/handbook/${page.id}`} className="flex h-5 items-center gap-2.5 rounded-control text-body text-primary no-underline hover:underline">
              <Icon icon={hubIcon(page.icon)} size="sm" className="shrink-0 text-tertiary" />
              <TruncatedTitle title={page.title} className="min-w-0" />
              {page.waiting && <span aria-label={t("handbook.waits")} className="size-1.5 shrink-0 rounded-pill bg-accent" />}
            </Link>
          </li>
        ))}
      </ul>
      {pages.length > 3 && (
        <Button type="button" variant="link" className="mt-1 w-fit" onClick={() => setOpen((o) => !o)}>
          {open ? t("handbook.showLess") : t("handbook.more", { count: pages.length - 3 })}
        </Button>
      )}
    </section>
  );
};

/** CP01, the handbook: every section the reader can see, in the editor's order, three columns. */
export const HandbookContainer: React.FC = () => {
  const t = useTranslations("hub");
  const company = useCompanyName();
  const handbook = useHandbook();
  const canEdit = useCanAccess("HUB.CONTENT", "EDIT");
  const router = useRouter();
  const data = handbook.data;

  // `#section-{id}` scrolls to the section once the grid is there.
  React.useEffect(() => {
    if (!data || typeof window === "undefined" || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [data]);

  return (
    <HubPage>
      <BackLink href="/hub" label={t("home.title")} />
      <HubTitle className="mt-3">{t("handbook.title")}</HubTitle>
      {data && (
        <p className="mt-1.5 text-body text-secondary">
          {t("handbook.lead", { company, pages: data.pageCount, sections: data.sectionCount })}
        </p>
      )}
      <HubAskBox className="mt-7 max-w-[860px]" placeholder={t("ask.handbookPlaceholder")} pagesOnly />
      <div className="mt-10 flex flex-1 flex-col">
        {handbook.isLoading ? (
          <LoadingBlock
            skeleton={
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-56 rounded-panel" />
                ))}
              </div>
            }
          />
        ) : handbook.isError || !data ? (
          <HubLoadError error={handbook.error} title={t("handbook.error")} onRetry={() => void handbook.refetch()} />
        ) : data.sections.length === 0 ? (
          // Centred in the free area under the ask box; employees get no button (FIXES U5).
          <HubState
            scene="policies"
            size="m"
            titleSize="section"
            title={t("handbook.empty")}
            line={t("handbook.emptyLine")}
            action={
              canEdit ? (
                <Button type="button" onClick={() => router.push("/hub/manage/pages")}>
                  <Icon icon={Add01Icon} size="sm" />
                  {t("handbook.addPage")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.sections.map((section) => (
              <SectionCardView key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </HubPage>
  );
};
