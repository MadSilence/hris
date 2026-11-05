"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, type FC } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Key01Icon,
  Logout01Icon,
  PreferenceHorizontalIcon,
  Search01Icon,
  SparklesIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/desact/dropdown-menu";
import { Skeleton } from "@/components/desact/skeleton";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/desact/sidebar";
import { NoddoWordmark } from "@/components/brand";
import { RowAction } from "@/components/ui/RowActionsMenu";
import { Company } from "@/models/company";

export type NavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
  badge?: number;
};

export type SidebarProfile = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
};

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  topItems: NavItem[];
  bottomItems: NavItem[];
  profile: SidebarProfile;
  company?: Company;
  /** Opens the quick-search window — the search row, and ⌘K / Ctrl+K anywhere. */
  onSearch: () => void;
  /** Ends the session on this browser. */
  onSignOut: () => void;
  /** Absent when the password is not the signed-in person's to change — an impersonated session. */
  onChangePassword?: () => void;
  /**
   * Offered while there is still something on the welcome worth doing — no photo, a field of their own
   * left blank. Absent otherwise, because a menu item that opens a finished form is a control that cannot
   * work.
   */
  showFinishProfile?: boolean;
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/** "⌘K" on Apple keyboards, "Ctrl K" elsewhere — read after mount, so the server's render and the first client render agree. */
const useSearchShortcutLabel = () => {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setLabel("⌘K");
  }, []);
  return label;
};

/**
 * The navigation column of SPEC § 13.6, top to bottom: the company's logo slot, search (⌘K), the items, a
 * spacer, Settings, the noddo wordmark — 12 px, gray, the one place noddo appears in the app's chrome — a
 * divider, and the profile block.
 */
const AppSidebar: FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  topItems,
  bottomItems,
  profile,
  company,
  onSearch,
  onSignOut,
  onChangePassword,
  showFinishProfile = false,
}) => {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const router = useRouter();
  const searchShortcut = useSearchShortcutLabel();

  const profileHref = profile.id ? `/organization/people/${profile.id}/personal` : "/organization/people";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen === collapsed) {
      onToggle?.();
    }
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const badge = item.badge && item.badge > 0 ? item.badge : 0;

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
          <Link href={item.href} aria-current={active ? "page" : undefined}>
            <Icon icon={item.icon} />
            <span>{item.label}</span>
            {badge > 0 &&
              (collapsed ? (
                <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-pill bg-sidebar-counter" />
              ) : (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-sidebar-counter px-1.5 text-hint font-medium text-sidebar-counter-text tabular-nums">
                  {badge > 99 ? "99+" : badge}
                </span>
              ))}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const companyName = company?.name ?? "";

  return (
    <SidebarProvider open={!collapsed} onOpenChange={handleOpenChange}>
      <Sidebar>
        <SidebarRail />

        <SidebarHeader className="pb-1">
          <div className="flex h-10 items-center gap-2 group-data-[state=collapsed]:justify-center">
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-control group-data-[state=collapsed]:flex-none"
              aria-label={companyName ? t("menu.companyHome", { company: companyName }) : t("menu.home")}
            >
              {company?.companyLogo ? (
                // The company's logo is primary (SPEC § 2): up to 160 × 32 expanded, a 32 px mark collapsed.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.companyLogo}
                  alt={companyName}
                  className="h-8 max-w-40 object-contain object-left group-data-[state=collapsed]:size-8 group-data-[state=collapsed]:object-cover"
                />
              ) : (
                <>
                  {/* No logo: the first letter on an accent square, radius 8 (SPEC § 4.7). */}
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-accent text-body font-semibold text-on-accent">
                    {companyName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate text-body font-semibold text-primary group-data-[state=collapsed]:hidden">
                    {companyName}
                  </span>
                </>
              )}
            </Link>
            <SidebarTrigger className="group-data-[state=collapsed]:hidden" />
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={t("menu.search")} onClick={onSearch} className="font-normal text-tertiary">
                <Icon icon={Search01Icon} />
                <span>{t("menu.search")}</span>
                <kbd className="ml-auto font-sans text-hint text-tertiary group-data-[state=collapsed]:hidden">
                  {searchShortcut}
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>{topItems.map(renderItem)}</SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="gap-3">
          {collapsed && <SidebarTrigger className="mx-auto" />}
          <SidebarMenu>{bottomItems.map(renderItem)}</SidebarMenu>

          <div className="flex px-2 text-sidebar-wordmark group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
            <NoddoWordmark tone="mono" height={12} />
          </div>

          <SidebarSeparator className="-mx-3 w-auto" />

          <SidebarMenu>
            <SidebarMenuItem>
              {/*
                The user menu: the profile block is its trigger; the items follow ACTIONS_AND_MENUS §§ 2–3
                through RowAction. Sign out is not destructive — nothing is lost — so it takes no separator
                and no red.
              */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip={profile.name}
                    aria-label={t("menu.account")}
                    className="h-12 gap-2 data-[state=open]:bg-sidebar-item-hover group-data-[state=collapsed]:size-10"
                  >
                    {profile.name ? (
                      <Avatar className="size-8">
                        <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
                        <AvatarFallback name={profile.name} className="text-hint">
                          {initialsOf(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      // Still loading: a shimmering circle (SPEC § 12), not a "?" that reads as an unknown person.
                      <Skeleton className="size-8 shrink-0 rounded-pill" />
                    )}
                    <span className="flex min-w-0 flex-col text-left group-data-[state=collapsed]:hidden">
                      <span className="truncate text-body font-medium text-primary">{profile.name}</span>
                      {profile.email && <span className="truncate text-hint font-normal text-tertiary">{profile.email}</span>}
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="top" align="start" className="w-56">
                  <RowAction icon={<Icon icon={UserIcon} size="sm" />} onClick={() => router.push(profileHref)}>
                    {t("menu.myProfile")}
                  </RowAction>

                  {showFinishProfile && (
                    <RowAction icon={<Icon icon={SparklesIcon} size="sm" />} onClick={() => router.push("/welcome?again=1")}>
                      {t("menu.finishProfile")}
                    </RowAction>
                  )}

                  <RowAction icon={<Icon icon={PreferenceHorizontalIcon} size="sm" />} onClick={() => router.push("/preferences")}>
                    {t("menu.myPreferences")}
                  </RowAction>

                  {onChangePassword && (
                    <RowAction icon={<Icon icon={Key01Icon} size="sm" />} onClick={onChangePassword}>
                      {t("menu.changePassword")}
                    </RowAction>
                  )}

                  <RowAction icon={<Icon icon={Logout01Icon} size="sm" />} onClick={onSignOut}>
                    {t("menu.signOut")}
                  </RowAction>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AppSidebar;
