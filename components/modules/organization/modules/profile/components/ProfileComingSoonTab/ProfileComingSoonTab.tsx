"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback/EmptyState";

type Props = {
  /** The tab's own label key, so the panel answers the tab that led to it. */
  tab: "publicProfile" | "salary" | "tasks" | "notes";
};

/**
 * What a profile tab that is not built yet opens.
 *
 * The profile's counterpart of `ComingSoonSettingsPage`: the tab is there so the shape of the profile
 * is visible, and the panel says plainly that nothing is behind it rather than showing invented data.
 * One component, not a copy per tab, so the day a tab is built there is one page to replace.
 */
export const ProfileComingSoonTab: React.FC<Props> = ({ tab }) => {
  const t = useTranslations("organization");
  return (
    <EmptyState
      fill
      scene="company-hub"
      title={t("profile.comingSoon.title", { tab: t(`profile.tabs.${tab}`) })}
      description={t("profile.comingSoon.description")}
    />
  );
};
