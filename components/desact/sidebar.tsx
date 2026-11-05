"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useIsMobile } from "./use-mobile";
import { Button } from "./button";
import { Icon } from "./icon";
import { Separator } from "./separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

/*
 * The app's navigation column (SPEC § 13.6). 240 px wide, 64 when collapsed — icons only, each with a tooltip.
 * It follows the app's theme: in the light theme the subtle surface with a hairline on the right, in the
 * dark theme the company colour mixed into the dark surface. Items are 32 px, radius 8, a 20 px icon and a
 * 14/20 medium label; the active one is the accent's muted tint with accent text. On a phone it is a sheet.
 *
 * ⌘B / Ctrl+B toggles it.
 */
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value);
      } else {
        setUncontrolledOpen(value);
      }
    },
    [setOpenProp],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";
  const value = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>
        <div data-slot="sidebar-wrapper" className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const t = useTranslations("common");

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) gap-0 rounded-none bg-sidebar p-0 text-sidebar-text [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("sidebar.title")}</SheetTitle>
            <SheetDescription>{t("sidebar.description")}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="group peer hidden text-sidebar-text md:block print:hidden" data-state={state} data-slot="sidebar">
      <div
        data-slot="sidebar-gap"
        className="relative w-(--sidebar-width) transition-[width] duration-(--duration-dialog) ease-standard group-data-[state=collapsed]:w-(--sidebar-collapsed)"
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 left-0 z-10 hidden h-svh w-(--sidebar-width) border-r border-sidebar-border bg-sidebar md:flex",
          "transition-[width] duration-(--duration-dialog) ease-standard group-data-[state=collapsed]:w-(--sidebar-collapsed)",
          className,
        )}
        {...props}
      >
        <div data-slot="sidebar-inner" className="flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar();
  const t = useTranslations("common");
  return (
    <Button
      type="button"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      aria-label={state === "expanded" ? t("sidebar.collapse") : t("sidebar.expand")}
      className={cn("text-sidebar-icon", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <Icon icon={SidebarLeftIcon} />
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations("common");
  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-label={t("sidebar.toggle")}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={t("sidebar.toggle")}
      className={cn(
        "absolute inset-y-0 -right-2 z-20 hidden w-4 cursor-w-resize sm:flex",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-strong",
        "group-data-[state=collapsed]:cursor-e-resize",
        className,
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-3", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-3", className)} {...props} />;
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" className={cn("bg-sidebar-border", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-3 group-data-[state=collapsed]:overflow-hidden", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

const menuButton = cn(
  "flex h-8 w-full min-w-0 items-center gap-3 overflow-hidden rounded-control px-2 text-left text-body font-medium text-sidebar-text outline-hidden",
  "transition-colors duration-(--duration-hover)",
  "hover:bg-sidebar-item-hover data-[active=true]:bg-sidebar-item-active data-[active=true]:text-sidebar-item-active-text",
  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sidebar-focus",
  "disabled:pointer-events-none disabled:text-disabled aria-disabled:pointer-events-none",
  "group-data-[state=collapsed]:size-10 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0",
  // Collapsed, the label goes — its tooltip says it; a badge's dot (aria-hidden) stays. Clipped to the 40 px square it
  // showed as "Sea", "I", "T" beside the icons (walk of 2026-11-05).
  "group-data-[state=collapsed]:[&>span:not([aria-hidden])]:hidden",
  "[&>svg]:text-sidebar-icon data-[active=true]:[&>svg]:text-sidebar-item-active-text [&>span:last-child]:truncate",
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp data-slot="sidebar-menu-button" data-active={isActive} className={cn(menuButton, className)} {...props} />
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export {
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
  useSidebar,
};
