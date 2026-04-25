"use client";

import Link from "next/link";
import type { ComponentType, FC, SVGProps } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage, } from "@/public/desact/src/components/ui/avatar";
import {
  Sidebar as DesactSidebar,
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
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AppSidebar: FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  topItems,
  bottomItems,
  profile,
}) => {
  const pathname = usePathname();

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
          className="
            relative h-10 px-3 text-sm font-medium
            text-sidebar-foreground/80
            hover:bg-sidebar-accent/60
            hover:text-sidebar-accent-foreground
            data-[active=true]:bg-sidebar-accent/70
            data-[active=true]:text-sidebar-accent-foreground
            data-[active=true]:font-semibold
            data-[active=true]:before:absolute
            data-[active=true]:before:left-0
            data-[active=true]:before:top-2
            data-[active=true]:before:h-6
            data-[active=true]:before:w-1
            data-[active=true]:before:rounded-r-full
            data-[active=true]:before:bg-sidebar-primary
            [&_svg]:size-4
          "
        >
          <Link href={item.href} className="gap-3 no-underline hover:no-underline">
            {Icon ? <Icon aria-hidden focusable={false}/> : null}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <DesactSidebar collapsible="icon" className="group/sidebar">
        <SidebarRail/>

        <SidebarHeader>
          <div className="relative flex h-14 items-center px-3">
            <Link
              href="/organization/people"
              className="
                flex min-w-0 items-center gap-3 no-underline hover:no-underline
                group-data-[collapsible=icon]/sidebar:mx-auto
              "
            >
              <span
                className="inline-block size-8 shrink-0 rounded-lg"
                style={{ background: "var(--color-sidebar-primary)" }}
                aria-hidden
              />

              <span
                className="
                  truncate text-[15px] font-semibold
                  group-data-[collapsible=icon]/sidebar:hidden
                "
              >
                SixSoftware
              </span>
            </Link>

            <SidebarTrigger
              aria-label="Toggle sidebar"
              className="
                ml-auto
                group-data-[collapsible=icon]/sidebar:absolute
                group-data-[collapsible=icon]/sidebar:left-1/2
                group-data-[collapsible=icon]/sidebar:top-1/2
                group-data-[collapsible=icon]/sidebar:-translate-x-1/2
                group-data-[collapsible=icon]/sidebar:-translate-y-1/2
                group-data-[collapsible=icon]/sidebar:opacity-0
                group-data-[collapsible=icon]/sidebar:hover:opacity-100
                group-data-[collapsible=icon]/sidebar:group-hover/sidebar:opacity-100
              "
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="px-2">
            {topItems.map(renderItem)}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu className="px-2">
            {bottomItems.map(renderItem)}
          </SidebarMenu>

          <SidebarSeparator className="-mx-2 w-auto"/>

          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={profile.name}
                className="
                  h-12 px-2
                  hover:bg-sidebar-accent/60
                "
              >
                <Link
                  href={`/organization/people/${profile.id}/personal`}
                  title={profile.name}
                  className="gap-3 no-underline hover:no-underline"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={profile.avatarUrl ?? undefined}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>

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
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </DesactSidebar>
    </SidebarProvider>
  );
};

export default AppSidebar;
