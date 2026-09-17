"use client";

import * as React from "react";
import { Hourglass } from "lucide-react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";

type Props = {
  /** The settings entry's own name, so the page answers the link that led to it. */
  title: string;
  /** Leave the header out when a layout above already renders one (Import & Export has tabs). */
  withHeader?: boolean;
};

/**
 * What a settings entry that is not built yet opens.
 *
 * These entries used to lead nowhere — a 404, or another entry's page, since several shared one wrong
 * route — and two of them rendered a mock with invented numbers. A menu that lies is worse than a
 * shorter menu; the owner chose to keep the entries and have each say plainly that it is coming. One
 * shared page, not a copy per entry, so the wording cannot drift and the day a page is built there is
 * one line to remove.
 */
export const ComingSoonSettingsPage: React.FC<Props> = ({ title, withHeader = true }) => (
  <div className="flex flex-col gap-6 px-8">
    {withHeader ? <SettingsPageHeader title={title} backHref="/settings" /> : null}
    <EmptyState
      icon={<Hourglass className="h-6 w-6" />}
      title={`${title} is not available yet`}
      description="This part of settings is planned and has not been built. Nothing here changes how the product works today."
    />
  </div>
);
