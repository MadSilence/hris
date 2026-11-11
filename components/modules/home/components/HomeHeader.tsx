"use client";

import React, { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar03Icon,
  Clock01Icon,
  DashboardSquare01Icon,
  File01Icon,
  Logout01Icon,
  Settings02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useSignOut } from "@/components/modules/auth/hooks/useSignOut";
import { cn } from "@/lib/cn";
import { useDateFormatter, useDisplayLocale } from "@/lib/date";
import type { HomeHeaderStyle } from "@/models/home";
import { greetingFor, hourInZone, isoDateInZone, weekdayOf } from "@/components/modules/home/utils/zonedTime";

const noSubscribe = () => () => {};

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";

/**
 * The band behind the top of Home (`home` spec, Layout 1): the company accent as a gradient with one quiet ring in its
 * corner — or, with the Light header, a white page and the ring in the muted accent. It sits behind the page's own
 * padding, so the first row of widgets rises over it.
 */
export const HomeBand: React.FC<{ style: HomeHeaderStyle; narrow?: boolean }> = ({ style }) => (
  <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-[380px] overflow-hidden max-[1281px]:h-[420px]", style === "COLOUR" && "home-band")}>
    <span
      className={cn(
        "absolute -top-[200px] -right-[180px] size-[600px] rounded-pill border-[80px]",
        style === "COLOUR" ? "home-ring-colour" : "home-ring-light",
      )}
    />
  </div>
);

/** My profile (P01): the reader's own pages, Edit home, their settings, and Log out after a divider. */
export const ProfileMenu: React.FC<{ style: HomeHeaderStyle; onEditHome?: () => void }> = ({ style, onEditHome }) => {
  const t = useTranslations("home");
  const router = useRouter();
  const signOut = useSignOut();
  const { user, userId } = useCurrentUser();
  const canSeeTimeOff = useCanAccess("PEOPLE.TIME_OFF", "VIEW");
  const canSeeDocuments = useCanAccess("PEOPLE.DOCUMENTS", "VIEW");
  const canSeeAttendance = useCanAccess("PEOPLE.ATTENDANCE", "VIEW");
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const job = user?.jobName ?? "";
  const team = user?.teams?.[0]?.name ?? user?.department?.name ?? "";
  const profile = (tab: string) => (userId ? `/organization/people/${userId}/${tab}` : "/organization/people");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("profileMenu.label")}
          className={cn(
            "flex h-11 items-center gap-2 rounded-pill border pr-3.5 pl-1 text-card-title transition-colors",
            style === "COLOUR"
              ? "band-glass on-band hover:opacity-90"
              : "border-field bg-card text-primary hover:border-strong hover:bg-subtle",
          )}
        >
          <Avatar className="size-[34px]">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback name={name} className="text-hint">{initialsOf(name)}</AvatarFallback>
          </Avatar>
          {t("header.myProfile")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px]">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-body font-medium text-primary">{name}</span>
          {(job || team) && (
            <span className="truncate text-hint font-normal text-tertiary">
              {t("profileMenu.jobLine", { hasJob: job ? "yes" : "no", job, both: job && team ? "yes" : "no", hasTeam: team ? "yes" : "no", team })}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push(profile("personal"))}>
          <Icon icon={UserIcon} size="sm" />
          {t("profileMenu.myProfile")}
        </DropdownMenuItem>
        {canSeeTimeOff && (
          <DropdownMenuItem onSelect={() => router.push(profile("time-off"))}>
            <Icon icon={Calendar03Icon} size="sm" />
            {t("profileMenu.myTimeOff")}
          </DropdownMenuItem>
        )}
        {canSeeDocuments && (
          <DropdownMenuItem onSelect={() => router.push(profile("documents"))}>
            <Icon icon={File01Icon} size="sm" />
            {t("profileMenu.myDocuments")}
          </DropdownMenuItem>
        )}
        {canSeeAttendance && (
          <DropdownMenuItem onSelect={() => router.push(profile("attendance"))}>
            <Icon icon={Clock01Icon} size="sm" />
            {t("profileMenu.myAttendance")}
          </DropdownMenuItem>
        )}
        {onEditHome && (
          <DropdownMenuItem onSelect={onEditHome}>
            <Icon icon={DashboardSquare01Icon} size="sm" />
            {t("profileMenu.editHome")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => router.push("/preferences")}>
          <Icon icon={Settings02Icon} size="sm" />
          {t("profileMenu.personalSettings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <Icon icon={Logout01Icon} size="sm" />
          {t("profileMenu.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * The date and "Good afternoon, Ulia" (`home` spec, Layout 3): the greeting by the reader's own hour, the date the
 * company's today. A long name wraps to two lines and is never cut. Drawn in the browser only — the hour is the
 * reader's clock, so a server-rendered greeting failed to hydrate (walk of 2026-10-29).
 */
export const Greeting: React.FC<{ style: HomeHeaderStyle }> = ({ style }) => {
  const t = useTranslations("home");
  const formatDisplayDate = useDateFormatter();
  const locale = useDisplayLocale();
  const { user } = useCurrentUser();
  const settings = useUserSettings();
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  const now = new Date();
  const companyZone = settings.data?.companyTimeZone ?? null;
  const hour = hourInZone(now, settings.data?.timeZone ?? companyZone);
  const today = isoDateInZone(now, companyZone);
  const name = user?.firstName?.trim();

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <p className={cn("text-body font-medium", style === "COLOUR" ? "on-band-quiet" : "text-accent-text")}>
        {inBrowser ? `${weekdayOf(today, locale)}, ${formatDisplayDate(today, { style: "medium", hideYear: true })}` : " "}
      </p>
      <h1 className={cn("text-home-greeting break-words", style === "COLOUR" ? "on-band" : "text-primary")}>
        {t("greeting.line", { part: inBrowser ? greetingFor(hour) : "welcome", hasName: name ? "yes" : "no", name: name ?? "" })}
      </h1>
    </div>
  );
};
