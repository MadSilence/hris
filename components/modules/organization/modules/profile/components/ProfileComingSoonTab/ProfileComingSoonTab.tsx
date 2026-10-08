"use client";

import * as React from "react";
import { Hourglass } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

type Props = {
  /** The tab's own label, so the panel answers the tab that led to it. */
  title: string;
};

/**
 * What a profile tab that is not built yet opens.
 *
 * The profile's counterpart of `ComingSoonSettingsPage`: the tab is there so the shape of the profile
 * is visible, and the panel says plainly that nothing is behind it rather than showing invented data.
 * One component, not a copy per tab, so the day a tab is built there is one page to replace.
 */
export const ProfileComingSoonTab: React.FC<Props> = ({ title }) => (
  <EmptyState
    fill
    icon={<Hourglass className="h-6 w-6"/>}
    title={`${title} is not available yet`}
    description="This part of the profile is planned and has not been built. Nothing here changes how the product works today."
  />
);
