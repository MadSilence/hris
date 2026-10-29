"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { useAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useUnreadNotificationsCount } from "@/components/modules/notifications/hooks/useUnreadNotificationsCount";
import { formatDisplayDate } from "@/lib/date";
import { availableWidgets } from "@/components/modules/home/widgets";
import { useSaveHomeLayout } from "@/components/modules/home/hooks";
import { HOME_GROUPS, HOME_GROUP_LABELS, arrangeHome, widgetsOf } from "@/components/modules/home/layout";
import { greetingFor, hourInZone, isoDateInZone, weekdayOf } from "@/components/modules/home/utils/zonedTime";
import { CustomizeHome } from "./CustomizeHome";

const noSubscribe = () => () => {};

/**
 * "Good morning, Anna", the company's today, and what is unread. The page's heading is the greeting (H1).
 *
 * Drawn in the browser only: the hour is the reader's clock and `formatDisplayDate` follows the reader's own
 * date format there and the defaults on the server, so a server-rendered greeting failed to hydrate (walk of
 * 2026-10-29) — the same answer as the attendance tab's date.
 */
const Greeting: React.FC<{ onCustomize?: () => void }> = ({ onCustomize }) => {
  const { user } = useCurrentUser();
  const settings = useUserSettings();
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  const unread = useUnreadNotificationsCount();
  const now = new Date();
  const companyZone = settings.data?.companyTimeZone ?? null;
  // The greeting follows the reader's own clock; the date is the company's, which is what "today" means here.
  const hour = hourInZone(now, settings.data?.timeZone ?? companyZone);
  const today = isoDateInZone(now, companyZone);
  const name = user?.firstName?.trim();
  const count = unread.data ?? 0;

  return (
    <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-brown-900">
          {inBrowser ? greetingFor(hour) : "Welcome"}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {inBrowser ? `${weekdayOf(today)}, ${formatDisplayDate(today, { style: "medium" })}` : "\u00a0"}
          {count > 0 && (
            <>
              {" · "}
              <Link href="/inbox?filter=unread" className="font-medium text-brown-700 hover:underline">
                Unread: {count}
              </Link>
            </>
          )}
        </p>
      </div>
      {onCustomize && (
        <Button type="button" variant="outline" size="sm" className="gap-1.5 self-start md:self-auto" onClick={onCustomize}>
          <SlidersHorizontal className="h-4 w-4" />
          Customize
        </Button>
      )}
    </section>
  );
};

/**
 * Home (`HOME_AND_SEARCH_DESIGN.md` § 4, as the owner answered it in sitting 2): a catalogue of widgets in
 * groups, each person arranging their own. **No page gate** — `/403` sends a refused reader here, so a gate
 * would loop (trap 7.4). Each widget is offered only to a reader who may see it, loads and fails on its own,
 * and sits in its own error boundary, so one widget never takes the page down with it.
 */
export const HomeContainer: React.FC = () => {
  const { access, loading } = useAccess();
  const settings = useUserSettings();
  const save = useSaveHomeLayout();
  const [customizing, setCustomizing] = useState(false);

  const available = useMemo(() => availableWidgets(access), [access]);
  const stored = useMemo(() => settings.data?.homeLayout ?? [], [settings.data?.homeLayout]);
  const arranged = useMemo(() => arrangeHome(available, stored), [available, stored]);

  // Until the reader's access and arrangement are known, nothing is drawn in a place it might not keep.
  if (loading || settings.isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Greeting />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  if (customizing) {
    return (
      <div className="flex max-w-3xl flex-col gap-6">
        <h1 className="text-3xl font-semibold text-brown-900">Customize Home</h1>
        <CustomizeHome
          available={available}
          stored={stored}
          saving={save.isPending}
          onCancel={() => setCustomizing(false)}
          onSave={async (placements) => {
            await save.mutateAsync(placements);
            setCustomizing(false);
          }}
        />
      </div>
    );
  }

  const shown = arranged.filter((entry) => !entry.hidden);

  return (
    <div className="flex flex-col gap-8">
      {/* A failed settings read still leaves a home: the default arrangement, and no Customize to save into. */}
      <Greeting onCustomize={settings.error ? undefined : () => setCustomizing(true)} />

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brown-200 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">Every widget is hidden.</p>
          <Button type="button" variant="link" onClick={() => setCustomizing(true)}>Customize Home</Button>
        </div>
      ) : (
        HOME_GROUPS.map((group) => {
          const entries = widgetsOf(shown, group);
          if (entries.length === 0) return null;
          return (
            <section key={group} className="flex flex-col gap-3" aria-label={HOME_GROUP_LABELS[group]}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brown-400">{HOME_GROUP_LABELS[group]}</h2>
              <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                {entries.map(({ widget }) => (
                  <ErrorBoundary key={widget.id}>
                    <widget.Component />
                  </ErrorBoundary>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};
