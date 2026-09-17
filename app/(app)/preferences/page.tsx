import { PersonalPreferencesForm } from "@/components/modules/firstRun/components/PersonalPreferencesForm";
import { NotificationPreferences } from "@/components/modules/notifications/components/NotificationPreferences";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";

export const metadata = { title: "My Preferences" };

/**
 * Everything a person sets about themselves, in one place.
 *
 * <p>The notification categories were already a screen of their own under the inbox, and the display
 * settings would have been a second one — two pages of "your own settings", found by two different
 * routes. `/inbox/preferences` now sends people here.
 */
export default function PreferencesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">My Preferences</h1>
        <PageDescription className="text-base text-muted-foreground/90">
          How the product reads to you, and what it tells you about.
        </PageDescription>
      </header>

      <section className="max-w-lg space-y-4">
        <h2 className="text-lg font-medium text-foreground">Dates and Time</h2>
        <PersonalPreferencesForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Notifications</h2>
        <NotificationPreferences />
      </section>
    </div>
  );
}
