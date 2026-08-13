import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { NotificationPreferences } from "@/components/modules/notifications/components/NotificationPreferences";

export default function NotificationPreferencesPage() {
  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-4 overflow-hidden">
      <div className="px-8 space-y-2 shrink-0">
        <SettingsPageHeader title="Notification preferences" backHref="/inbox" />

        <PageDescription className="text-base text-muted-foreground/90">
          Choose which categories of notifications you receive.
        </PageDescription>
      </div>

      <div className="flex-1 min-h-0">
        <NotificationPreferences />
      </div>
    </div>
  );
}
