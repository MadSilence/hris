"use client";

import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { COMPONENTS_DATA } from "@/public/desact/src/components/constants/componentsData";

const PAGES: Record<string, React.ComponentType<any>> = {
  "read-me": dynamic(() =>
    import("@/public/desact/src/components/ReadMePage").then((m) => m.ReadMePage),
  ),
  "typography-system": dynamic(() =>
    import("@/public/desact/src/components/TypographySystemPage").then((m) => m.TypographySystemPage),
  ),
  "system-colors": dynamic(() =>
    import("@/public/desact/src/components/SystemColorsPage").then((m) => m.SystemColorsPage),
  ),
  "icons": dynamic(() =>
    import("@/public/desact/src/components/IconsPage").then((m) => m.IconsPage),
  ),
  "components": dynamic(() =>
    import("@/public/desact/src/components/ComponentsPage").then((m) => m.ComponentsPage),
  ),
  "buttons": dynamic(() =>
    import("@/public/desact/src/components/ButtonsPage").then((m) => m.ButtonsPage),
  ),
  "forms": dynamic(() =>
    import("@/public/desact/src/components/FormsPage").then((m) => m.FormsPage),
  ),
  "input": dynamic(() =>
    import("@/public/desact/src/components/InputPage").then((m) => m.InputPage),
  ),
  "layout": dynamic(() =>
    import("@/public/desact/src/components/LayoutPage").then((m) => m.LayoutPage),
  ),
  "hr-cards": dynamic(() =>
    import("@/public/desact/src/components/HRCardsPage").then((m) => m.HRCardsPage),
  ),
  "accordion": dynamic(() =>
    import("@/public/desact/src/components/AccordionPage").then((m) => m.AccordionPage),
  ),
  "navigation": dynamic(() =>
    import("@/public/desact/src/components/NavigationPage").then((m) => m.NavigationPage),
  ),
  "breadcrumbs": dynamic(() =>
    import("@/public/desact/src/components/BreadcrumbsPage").then((m) => m.BreadcrumbsPage),
  ),
  "pagination": dynamic(() =>
    import("@/public/desact/src/components/PaginationPage").then((m) => m.PaginationPage),
  ),
  "interaction": dynamic(() =>
    import("@/public/desact/src/components/InteractionPage").then((m) => m.InteractionPage),
  ),
  "badges": dynamic(() =>
    import("@/public/desact/src/components/BadgesPage").then((m) => m.BadgesPage),
  ),
  "alerts": dynamic(() =>
    import("@/public/desact/src/components/AlertsPage").then((m) => m.AlertsPage),
  ),
  "data-display": dynamic(() =>
    import("@/public/desact/src/components/DataDisplayPage").then((m) => m.DataDisplayPage),
  ),
  "charts": dynamic(() =>
    import("@/public/desact/src/components/ChartsPage").then((m) => m.ChartsPage),
  ),
  "lists": dynamic(() =>
    import("@/public/desact/src/components/ListsPage").then((m) => m.ListsPage),
  ),
  "skeletons": dynamic(() =>
    import("@/public/desact/src/components/SkeletonsPage").then((m) => m.SkeletonsPage),
  ),
  "modals": dynamic(() =>
    import("@/public/desact/src/components/ModalsPage").then((m) => m.ModalsPage),
  ),
  "drawer": dynamic(() =>
    import("@/public/desact/src/components/DrawerPage").then((m) => m.DrawerPage),
  ),
  "avatars": dynamic(() =>
    import("@/public/desact/src/components/AvatarsPage").then((m) => m.AvatarsPage),
  ),
  "file-upload": dynamic(() =>
    import("@/public/desact/src/components/FileUploadPage").then((m) => m.FileUploadPage),
  ),
  "miscellaneous": dynamic(() =>
    import("@/public/desact/src/components/MiscellaneousPage").then((m) => m.MiscellaneousPage),
  ),
  "dashboard": dynamic(() =>
    import("@/public/desact/src/components/DashboardPage").then((m) => m.DashboardPage),
  ),
  "simple-insight": dynamic(() =>
    import("@/public/desact/src/components/SimpleInsightPage").then((m) => m.SimpleInsightPage),
  ),
  "color-picker": dynamic(() =>
    import("@/public/desact/src/components/ColorPickerPage").then((m) => m.ColorPickerPage),
  ),
  "command-menu": dynamic(() =>
    import("@/public/desact/src/components/CommandMenuPage").then((m) => m.CommandMenuPage),
  ),
  "text-editor": dynamic(() =>
    import("@/public/desact/src/components/TextEditorPage").then((m) => m.TextEditorPage),
  ),
  "status": dynamic(() =>
    import("@/public/desact/src/components/StatusPage").then((m) => m.StatusPage),
  ),
  "page-headers": dynamic(() =>
    import("@/public/desact/src/components/PageHeadersPage").then((m) => m.PageHeadersPage),
  ),
  "card-headers": dynamic(() =>
    import("@/public/desact/src/components/CardHeadersPage").then((m) => m.CardHeadersPage),
  ),
  "section-footers": dynamic(() =>
    import("@/public/desact/src/components/SectionFootersPage").then((m) => m.SectionFootersPage),
  ),
  "header-navigations": dynamic(() =>
    import("@/public/desact/src/components/HeaderNavigationsPage").then((m) => m.HeaderNavigationsPage),
  ),
  "activity-gauges": dynamic(() =>
    import("@/public/desact/src/components/ActivityGaugesPage").then((m) => m.ActivityGaugesPage),
  ),
  "slideout-menus": dynamic(() =>
    import("@/public/desact/src/components/SlideoutMenusPage").then((m) => m.SlideoutMenusPage),
  ),
  "inline-ctas": dynamic(() =>
    import("@/public/desact/src/components/InlineCTAsPage").then((m) => m.InlineCTAsPage),
  ),
  "carousels": dynamic(() =>
    import("@/public/desact/src/components/CarouselsPage").then((m) => m.CarouselsPage),
  ),
  "carousels-fixed": dynamic(() =>
    import("@/public/desact/src/components/CarouselsPageFixed").then((m) => m.CarouselsPageFixed),
  ),
  "progress-steps": dynamic(() =>
    import("@/public/desact/src/components/ProgressStepsPage").then((m) => m.ProgressStepsPage),
  ),
  "progress-steps-fixed": dynamic(() =>
    import("@/public/desact/src/components/ProgressStepsPageFixed").then((m) => m.ProgressStepsPageFixed),
  ),
  "activity-feeds": dynamic(() =>
    import("@/public/desact/src/components/ActivityFeedsPage").then((m) => m.ActivityFeedsPage),
  ),
  "messaging": dynamic(() =>
    import("@/public/desact/src/components/MessagingPage").then((m) => m.MessagingPage),
  ),
  "messaging-fixed": dynamic(() =>
    import("@/public/desact/src/components/MessagingPageFixed").then((m) => m.MessagingPageFixed),
  ),
  "tabs": dynamic(() =>
    import("@/public/desact/src/components/TabsPage").then((m) => m.TabsPage),
  ),
  "tables": dynamic(() =>
    import("@/public/desact/src/components/TablesPage").then((m) => m.TablesPage),
  ),
  "notifications": dynamic(() =>
    import("@/public/desact/src/components/NotificationsPage").then((m) => m.NotificationsPage),
  ),
  "notifications-new": dynamic(() =>
    import("@/public/desact/src/components/NotificationsPageNew").then((m) => m.NotificationsPageNew),
  ),
  "calendars": dynamic(() =>
    import("@/public/desact/src/components/CalendarsPage").then((m) => m.CalendarsPage),
  ),
  "code-snippets": dynamic(() =>
    import("@/public/desact/src/components/CodeSnippetsPage").then((m) => m.CodeSnippetsPage),
  ),
  "auth-card": dynamic(() =>
    import("@/public/desact/src/components/ComponentCard").then((m) => m.ComponentCard),
  ),
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function DesactDynamicPage() {
  const router = useRouter();
  const params = useParams<{ page: string }>();
  const slug = params?.page ?? "read-me";
  const Comp = PAGES[slug] ?? PAGES["read-me"];

  const onBack = () => router.push("/desact");
  const onComponentClick = (name: string) => {
    const s = name.toLowerCase().replace(/\s+/g, "-");
    router.push(`/desact/${s}`);
  };

  return (
    <Comp
      onBack={onBack}
      components={COMPONENTS_DATA}
      onComponentClick={onComponentClick}
      currentComponent={titleFromSlug(slug)}
    />
  );
}
