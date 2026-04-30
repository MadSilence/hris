"use client";

import Link from "next/link";
import type { ComponentType, FC, SVGProps } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage, } from "@/public/desact/src/components/ui/avatar";
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
} from "@/public/desact/src/components/ui/sidebar";
import { Company } from "@/models/company";

export type NavItem = {
  label: string;
  href: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type SidebarProfile = {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string | null;
};

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  topItems: NavItem[];
  bottomItems: NavItem[];
  profile: SidebarProfile;
  company?: Company;
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "U";
};

const AppSidebar: FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  topItems,
  bottomItems,
  profile,
  company,
}) => {
  const pathname = usePathname();

  const profileHref = profile.id
    ? `/organization/people/${profile.id}/personal`
    : "/organization/people";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const open = !collapsed;

  const handleOpenChange = (nextOpen: boolean) => {
    const nextCollapsed = !nextOpen;

    if (nextCollapsed !== collapsed) {
      onToggle?.();
    }
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.Icon;

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          aria-current={active ? "page" : undefined}
          className={[
            "mx-auto h-10 rounded-lg text-sm font-normal",
            "text-sidebar-foreground/80",
            "hover:bg-brown-50",
            "hover:text-brown-700",
            "data-[active=true]:bg-brown-50",
            "data-[active=true]:text-brown-700",
            "data-[active=true]:font-normal",
            "[&_svg]:size-4",
            "[&_svg]:text-brown-600",
            collapsed ? "size-10 px-0" : "w-full px-3",
          ].join(" ")}
        >
          <Link
            href={item.href}
            className={[
              "no-underline hover:no-underline",
              collapsed ? "justify-center gap-0" : "gap-3",
            ].join(" ")}
          >
            {Icon ? <Icon aria-hidden focusable={false}/> : null}
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <Sidebar
        collapsible="icon"
        className="
          group/sidebar
          [&_[data-sidebar=header]]:p-2
          [&_[data-sidebar=content]]:px-2
          [&_[data-sidebar=footer]]:p-2
          [&_[data-sidebar=menu]]:gap-1
        "
      >
        <SidebarRail/>

        <SidebarHeader>
          <div className="relative flex h-12 items-center">
            <div
              className={[
                "group/logo relative flex min-w-0 items-center",
                collapsed ? "w-10 justify-center" : "flex-1",
              ].join(" ")}
            >
              <Link
                href="/dashboard"
                className={[
                  "min-w-0 items-center rounded-lg no-underline hover:no-underline",
                  collapsed
                    ? "flex size-10 justify-center p-0"
                    : "flex flex-1 gap-3 px-2 py-2",
                ].join(" ")}
              >
                <Avatar className="size-8 shrink-0 rounded-lg">
                  <AvatarImage
                    src={company?.companyLogo ?? undefined}
                    alt={company?.name ?? "Company logo"}
                  />
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {getInitials(company?.name ?? "Company")}
                  </AvatarFallback>
                </Avatar>

                {!collapsed ? (
                  <span className="truncate text-[15px] font-semibold">
            {company?.name ?? "Loading..."}
          </span>
                ) : null}
              </Link>

              <SidebarTrigger
                aria-label="Toggle sidebar"
                className={[
                  "size-8",
                  collapsed
                    ? "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/logo:opacity-100"
                    : "ml-auto",
                ].join(" ")}
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>{topItems.map(renderItem)}</SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>{bottomItems.map(renderItem)}</SidebarMenu>

          <SidebarSeparator className="!mx-[-8px] !w-[calc(100%+16px)] !max-w-none"/>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={profile.name}
                className={[
                  "mx-auto hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent/60",
                  collapsed ? "size-10 px-0" : "h-12 w-full px-2",
                ].join(" ")}
              >
                <Link
                  href={profileHref}
                  title={profile.name}
                  className={[
                    "p-0 no-underline hover:no-underline",
                    collapsed ? "justify-center gap-0" : "gap-3",
                  ].join(" ")}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage
                      src={profile.avatarUrl ?? undefined}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>

                  {!collapsed ? (
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {profile.name}
                      </span>

                      {profile.role ? (
                        <span className="truncate text-xs text-sidebar-foreground/55">
                          {profile.role}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AppSidebar;
