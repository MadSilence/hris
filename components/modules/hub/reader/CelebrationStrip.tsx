"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BirthdayCakeIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import { useCelebrations } from "@/components/modules/home/hooks";
import { dateToISO } from "@/lib/date";
import type { Celebration } from "@/models/home";
import type { HubCelebrations } from "@/models/hub";
import { PersonAvatar, TruncatedTitle } from "../shared";
import { LoadingBlock } from "../shared/LoadingBlock";

const nameOf = (c: Celebration) => `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();

/** Today's birthdays and anniversaries, this week's joiners — each kind only while the company keeps it on (CM04). */
export const pickCelebrations = (items: Celebration[], flags: HubCelebrations, today: string) => {
  if (!flags.enabled) return { birthdays: [], anniversaries: [], joiners: [] };
  return {
    birthdays: flags.birthdays ? items.filter((c) => c.kind === "BIRTHDAY" && c.date === today) : [],
    anniversaries: flags.anniversaries ? items.filter((c) => c.kind === "ANNIVERSARY" && c.date === today) : [],
    joiners: flags.joiners ? items.filter((c) => c.kind === "NEW_JOINER") : [],
  };
};

const Tile: React.FC<{ tint: string; href?: string; children: React.ReactNode }> = ({ tint, href, children }) => {
  const className = `flex h-[72px] w-[300px] shrink-0 items-center gap-3 rounded-panel px-5 py-4 no-underline ${tint}`;
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
};

/**
 * The celebrations strip (`CelebrationStrip`, CH01): one row of tiles that scrolls sideways with a fade at the right.
 * Birthdays are Berry, anniversaries Ocean, the welcome Teal — the colour is decoration, the words carry it. The data
 * is Home's This week (`/home/celebrations`), which already leaves out a person who hid their own birthday (Q-7).
 * Nothing to celebrate, or celebrations off: the strip is not drawn at all.
 */
export const CelebrationStrip: React.FC<{ flags: HubCelebrations }> = ({ flags }) => {
  const t = useTranslations("hub");
  const query = useCelebrations(true, flags.enabled);
  const today = dateToISO(new Date());

  if (!flags.enabled) return null;
  if (query.isLoading) {
    return (
      <LoadingBlock
        className="mt-10"
        skeleton={
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[72px] w-[300px] rounded-panel" />
            ))}
          </div>
        }
      />
    );
  }
  // A reader the directory does not open to (PEOPLE.PROFILE) simply has no strip: it is not an error to them.
  if (query.isError) {
    if (query.error instanceof ForbiddenError) return null;
    return (
      <div className="mt-10">
        <ErrorState compact error={query.error} title={t("home.celebrationsError")} onRetry={() => void query.refetch()} />
      </div>
    );
  }

  const { birthdays, anniversaries, joiners } = pickCelebrations(query.data?.items ?? [], flags, today);
  if (birthdays.length + anniversaries.length + joiners.length === 0) return null;
  const firstNames = joiners.map((j) => j.firstName ?? nameOf(j));

  return (
    <section aria-label={t("home.celebrations")} className="relative mt-10">
      <div className="flex gap-3 overflow-x-auto pr-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {birthdays.map((c) => (
          <Tile key={`b-${c.userId}`} tint="bg-tag-berry-bg" href={`/organization/people/${c.userId}/personal`}>
            <span className="relative shrink-0">
              <PersonAvatar person={{ name: nameOf(c), avatarUrl: c.avatarUrl }} size={40} />
              <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-pill bg-card text-tag-berry-text">
                <Icon icon={BirthdayCakeIcon} size="sm" className="size-3" />
              </span>
            </span>
            <span className="flex min-w-0 flex-col">
              <TruncatedTitle title={t("home.birthday", { name: c.firstName ?? nameOf(c) })} className="text-body font-semibold text-tag-berry-text" />
              <span className="text-hint text-tag-berry-text">{t("home.today")}</span>
            </span>
          </Tile>
        ))}
        {anniversaries.map((c) => (
          <Tile key={`a-${c.userId}`} tint="bg-tag-ocean-bg" href={`/organization/people/${c.userId}/personal`}>
            <span className="text-hub-celebration text-tag-ocean-text tabular-nums">{c.years ?? 1}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <TruncatedTitle
                title={t("home.anniversary", { count: c.years ?? 1, name: c.firstName ?? nameOf(c) })}
                className="text-body font-semibold text-tag-ocean-text"
              />
              <span className="text-hint text-tag-ocean-text">{t("home.today")}</span>
            </span>
            <PersonAvatar person={{ name: nameOf(c), avatarUrl: c.avatarUrl }} size={40} />
          </Tile>
        ))}
        {joiners.length > 0 && (
          <Tile tint="bg-tag-teal-bg">
            <span className="flex shrink-0 -space-x-2">
              {joiners.slice(0, 3).map((j) => (
                <PersonAvatar key={j.userId} person={{ name: nameOf(j), avatarUrl: j.avatarUrl }} size={32} className="ring-2 ring-card" />
              ))}
              {joiners.length > 3 && (
                <span className="flex size-8 items-center justify-center rounded-pill bg-card text-hint font-semibold text-tag-teal-text ring-2 ring-card">
                  +{joiners.length - 3}
                </span>
              )}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-body font-semibold text-tag-teal-text">{t("home.welcome")}</span>
              <TruncatedTitle
                title={
                  firstNames.length > 3
                    ? t("home.joinedMore", { names: firstNames.slice(0, 2).join(", "), count: firstNames.length - 2 })
                    : t("home.joined", { names: firstNames.join(", ") })
                }
                className="text-hint text-tag-teal-text"
              />
            </span>
          </Tile>
        )}
      </div>
      <span aria-hidden className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-card to-transparent" />
    </section>
  );
};
