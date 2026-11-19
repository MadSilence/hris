"use client";

import React, { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar03Icon,
  Clock01Icon,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useSignOut } from "@/components/modules/auth/hooks/useSignOut";
import { useWaitingOnMe } from "@/components/modules/notifications/hooks/useWaitingOnMe";
import { toSignOf } from "@/components/modules/home/widgets/toSign";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import type { HomeHeaderStyle } from "@/models/home";
import { greetingFor, hourInZone, isoDateInZone } from "@/components/modules/home/utils/zonedTime";

const noSubscribe = () => () => {};

/** How many documents wait for the reader's signature — the same list To sign shows (`/me/actions`). */
const useToSignCount = (enabled: boolean) => {
  const waiting = useWaitingOnMe(enabled);
  return enabled ? toSignOf(waiting.data).length : 0;
};

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";

/**
 * The band behind the top of Home (`home` spec, Layout 1): the company accent as a gradient with one quiet ring in its
 * corner — or, with the Light header, a white page and the ring in the muted accent. It sits behind the page's own
 * padding, so the first row of widgets rises over it. `height` is Edit home's: its band ends part-way down the zoomed
 * first row (E3).
 */
export const HomeBand: React.FC<{ style: HomeHeaderStyle; height?: number }> = ({ style, height }) => (
  <div
    aria-hidden
    style={height ? { height } : undefined}
    className={cn("pointer-events-none absolute inset-x-0 top-0 h-[380px] overflow-hidden max-[1281px]:h-[420px]", style === "COLOUR" && "home-band")}
  >
    <span
      className={cn(
        "absolute -top-[200px] -right-[180px] size-[600px] rounded-pill border-[80px]",
        style === "COLOUR" ? "home-ring-colour" : "home-ring-light",
      )}
    />
  </div>
);

/**
 * My profile (P01; the designers' Home fixes H13): no name header — the menu starts with the reader's own pages, then
 * their settings, then Log out, each group after a divider. Edit home is only the button at the end of Home. "My
 * documents" carries "{n} to sign" when something waits for the reader's signature.
 */
export const ProfileMenu: React.FC<{ style: HomeHeaderStyle }> = ({ style }) => {
  const t = useTranslations("home");
  const router = useRouter();
  const signOut = useSignOut();
  const { user, userId } = useCurrentUser();
  const canSeeTimeOff = useCanAccess("PEOPLE.TIME_OFF", "VIEW");
  const canSeeDocuments = useCanAccess("PEOPLE.DOCUMENTS", "VIEW");
  const canSeeAttendance = useCanAccess("PEOPLE.ATTENDANCE", "VIEW");
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const toSign = useToSignCount(canSeeDocuments);
  const profile = (tab: string) => (userId ? `/organization/people/${userId}/${tab}` : "/organization/people");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("profileMenu.label")}
          className={cn(
            "flex h-11 items-center gap-2 rounded-pill border pr-3.5 pl-1 text-home-pill transition-colors",
            style === "COLOUR"
              ? "band-glass on-band hover:opacity-90"
              : "border-divider bg-card text-primary hover:border-strong hover:bg-subtle",
          )}
        >
          <Avatar className="size-[34px]">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback name={name}>{initialsOf(name)}</AvatarFallback>
          </Avatar>
          {t("header.myProfile")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px]">

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
            {toSign > 0 && (
              <StatusBadge status="pending" size="sm" className="ml-auto" label={t("profileMenu.toSign", { count: toSign })} />
            )}
          </DropdownMenuItem>
        )}
        {canSeeAttendance && (
          <DropdownMenuItem onSelect={() => router.push(profile("attendance"))}>
            <Icon icon={Clock01Icon} size="sm" />
            {t("profileMenu.myAttendance")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
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
 * company's today — "Wednesday, 18 November", in Rose on the band (H2). A long name wraps to two lines and is never
 * cut. Drawn in the browser only — the hour is the reader's clock, so a server-rendered greeting failed to hydrate
 * (walk of 2026-10-29). `faded` while the AI box is open over the row (H1): in place, 150 ms, and not in the narrow
 * layout, where the box sits under it.
 */
export const Greeting: React.FC<{ style: HomeHeaderStyle; faded?: boolean }> = ({ style, faded }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const { user } = useCurrentUser();
  const settings = useUserSettings();
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  const now = new Date();
  const companyZone = settings.data?.companyTimeZone ?? null;
  const hour = hourInZone(now, settings.data?.timeZone ?? companyZone);
  const today = isoDateInZone(now, companyZone);
  const name = user?.firstName?.trim();

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2.5 transition-opacity duration-150",
        faded && "@min-[1000px]:pointer-events-none @min-[1000px]:opacity-0",
      )}
    >
      <p className={cn("text-body font-medium", style === "COLOUR" ? "on-band-tint" : "text-accent-text")}>
        {inBrowser ? dates.long(today, { weekday: true, hideYear: true }) : " "}
      </p>
      <h1 className={cn("text-home-greeting break-words", style === "COLOUR" ? "on-band" : "text-primary")}>
        {t("greeting.line", { part: inBrowser ? greetingFor(hour) : "welcome", hasName: name ? "yes" : "no", name: name ?? "" })}
      </h1>
    </div>
  );
};
