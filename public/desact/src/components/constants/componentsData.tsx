import React from 'react';
import {
  ReadMeThumbnail,
  AccordionThumbnail,
  AuthCardThumbnail,
  BreadcrumbsThumbnail,
  ColorPickerThumbnail,
  CommandMenuThumbnail,

  DrawerThumbnail,
  ButtonThumbnail,
  InputThumbnail,
  FormsThumbnail,
  LayoutThumbnail,
  HRCardsThumbnail,
  DataDisplayThumbnail,
  InteractionThumbnail,
  NavigationThumbnail,
  ModalsThumbnail,
  ListsThumbnail,
  ChartsThumbnail,
  TypographyThumbnail,
  IconsThumbnail,
  StatusThumbnail,
  MiscellaneousThumbnail,
  AvatarsThumbnail,
  FileUploadThumbnail,
  DashboardThumbnail,
  PaginationThumbnail,
  SystemColorsThumbnail,
  AlertsThumbnail,
  BadgesThumbnail,
  SkeletonsThumbnail,


  TextEditorThumbnail,
  // New Application UI Thumbnails
  PageHeadersThumbnail,
  CardHeadersThumbnail,
  SectionFootersThumbnail,

  HeaderNavigationsThumbnail,

  ActivityGaugesThumbnail,

  SlideoutMenusThumbnail,
  InlineCTAsThumbnail,
  CarouselsThumbnail,
  ProgressStepsThumbnail,
  ActivityFeedsThumbnail,
  MessagingThumbnail,
  TabsThumbnail,
  TablesThumbnail,
  NotificationsThumbnail,

  CalendarsThumbnail,

  ContentDividersThumbnail,
  LoadingIndicatorsThumbnail,
  EmptyStatesThumbnail,
  CodeSnippetsThumbnail,
  SimpleInsightThumbnail
} from '../ComponentThumbnails';

export interface ComponentData {
  name: string;
  blockCount: number;
  thumbnail: React.ReactNode;
  category: string;
}

export const COMPONENTS_DATA: ComponentData[] = [
  // Documentation - ReadMe as first component
  { name: 'Read Me', blockCount: 1, thumbnail: <ReadMeThumbnail />, category: 'Documentation' },
  { name: 'Typography', blockCount: 6, thumbnail: <TypographyThumbnail />, category: 'Documentation' },
  { name: 'System Colors', blockCount: 48, thumbnail: <SystemColorsThumbnail />, category: 'Documentation' },
  { name: 'Icons', blockCount: 200, thumbnail: <IconsThumbnail />, category: 'Documentation' },

  // Base Components (moved from Application UI + existing)
  { name: 'Buttons', blockCount: 8, thumbnail: <ButtonThumbnail />, category: 'Base components' },
  { name: 'Forms', blockCount: 15, thumbnail: <FormsThumbnail />, category: 'Base components' },
  { name: 'Input', blockCount: 8, thumbnail: <InputThumbnail />, category: 'Base components' },
  { name: 'Layout', blockCount: 6, thumbnail: <LayoutThumbnail />, category: 'Base components' },
  { name: 'HR Cards', blockCount: 18, thumbnail: <HRCardsThumbnail />, category: 'Base components' },
  { name: 'Accordion', blockCount: 4, thumbnail: <AccordionThumbnail />, category: 'Base components' },
  { name: 'Navigation', blockCount: 7, thumbnail: <NavigationThumbnail />, category: 'Base components' },
  { name: 'Breadcrumbs', blockCount: 4, thumbnail: <BreadcrumbsThumbnail />, category: 'Base components' },
  { name: 'Pagination', blockCount: 5, thumbnail: <PaginationThumbnail />, category: 'Base components' },
  { name: 'Interaction', blockCount: 5, thumbnail: <InteractionThumbnail />, category: 'Base components' },
  { name: 'Badges', blockCount: 8, thumbnail: <BadgesThumbnail />, category: 'Base components' },
  { name: 'Alerts', blockCount: 7, thumbnail: <AlertsThumbnail />, category: 'Base components' },
  
  // Moved from Application UI to Base components
  { name: 'Data Display', blockCount: 4, thumbnail: <DataDisplayThumbnail />, category: 'Base components' },
  { name: 'Charts', blockCount: 8, thumbnail: <ChartsThumbnail />, category: 'Base components' },
  { name: 'Lists', blockCount: 3, thumbnail: <ListsThumbnail />, category: 'Base components' },
  { name: 'Skeletons', blockCount: 6, thumbnail: <SkeletonsThumbnail />, category: 'Base components' },
  { name: 'Modals', blockCount: 5, thumbnail: <ModalsThumbnail />, category: 'Base components' },
  { name: 'Drawer', blockCount: 9, thumbnail: <DrawerThumbnail />, category: 'Base components' },
  { name: 'Avatars', blockCount: 6, thumbnail: <AvatarsThumbnail />, category: 'Base components' },
  { name: 'File Upload', blockCount: 4, thumbnail: <FileUploadThumbnail />, category: 'Base components' },
  { name: 'Miscellaneous', blockCount: 24, thumbnail: <MiscellaneousThumbnail />, category: 'Base components' },

  // Application UI Components
  { name: 'Dashboard', blockCount: 8, thumbnail: <DashboardThumbnail />, category: 'Application UI' },
  { name: 'Simple Insight', blockCount: 18, thumbnail: <SimpleInsightThumbnail />, category: 'Application UI' },
  { name: 'Color Picker', blockCount: 6, thumbnail: <ColorPickerThumbnail />, category: 'Application UI' },
  { name: 'Command Menu', blockCount: 5, thumbnail: <CommandMenuThumbnail />, category: 'Application UI' },
  { name: 'Text Editor', blockCount: 9, thumbnail: <TextEditorThumbnail />, category: 'Application UI' },
  { name: 'Status', blockCount: 5, thumbnail: <StatusThumbnail />, category: 'Application UI' },
  { name: 'Page Headers', blockCount: 8, thumbnail: <PageHeadersThumbnail />, category: 'Application UI' },
  { name: 'Card Headers', blockCount: 8, thumbnail: <CardHeadersThumbnail />, category: 'Application UI' },

  { name: 'Section footers', blockCount: 7, thumbnail: <SectionFootersThumbnail />, category: 'Application UI' },
  { name: 'Header navigations', blockCount: 6, thumbnail: <HeaderNavigationsThumbnail />, category: 'Application UI' },
  { name: 'Activity gauges', blockCount: 5, thumbnail: <ActivityGaugesThumbnail />, category: 'Application UI' },
  { name: 'Slideout menus', blockCount: 5, thumbnail: <SlideoutMenusThumbnail />, category: 'Application UI' },
  { name: 'Inline CTAs', blockCount: 7, thumbnail: <InlineCTAsThumbnail />, category: 'Application UI' },
  { name: 'Carousels', blockCount: 6, thumbnail: <CarouselsThumbnail />, category: 'Application UI' },
  { name: 'Progress steps', blockCount: 5, thumbnail: <ProgressStepsThumbnail />, category: 'Application UI' },
  { name: 'Activity feeds', blockCount: 8, thumbnail: <ActivityFeedsThumbnail />, category: 'Application UI' },
  { name: 'Messaging', blockCount: 9, thumbnail: <MessagingThumbnail />, category: 'Application UI' },
  { name: 'Tabs', blockCount: 6, thumbnail: <TabsThumbnail />, category: 'Application UI' },
  { name: 'Tables', blockCount: 12, thumbnail: <TablesThumbnail />, category: 'Application UI' },
  { name: 'Notifications', blockCount: 7, thumbnail: <NotificationsThumbnail />, category: 'Application UI' },
  { name: 'Calendars', blockCount: 6, thumbnail: <CalendarsThumbnail />, category: 'Application UI' },
  { name: 'Code snippets', blockCount: 5, thumbnail: <CodeSnippetsThumbnail />, category: 'Application UI' },

  // Marketing
  { name: 'Auth Card', blockCount: 8, thumbnail: <AuthCardThumbnail />, category: 'Marketing' },
];