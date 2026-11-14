"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { cn } from "@/lib/cn";
import type { HomeHeaderStyle } from "@/models/home";
import { availableWidgets, homeRoleOf } from "@/components/modules/home/widgets";
import { arrangeHome } from "@/components/modules/home/layout";
import { flushWrites } from "@/components/modules/home/deferred";
import { EditHome } from "@/components/modules/home/edit";
import { WidgetCell, WidgetGrid } from "./WidgetGrid";
import { Greeting, HomeBand, ProfileMenu } from "./HomeHeader";
import { AiBox } from "./AiBox";
import { HomeRequestTimeOffProvider } from "./HomeRequestTimeOff";

/**
 * Home (`hris/design/screens/home`, the redesign of 2026-11-11): the header band with the greeting, the AI box and My
 * profile; then one free grid of widgets, each at its size, in the person's order; Edit home at the end. **No page
 * gate** — `/403` sends a refused reader here, so a gate would loop (`HOME_AND_SEARCH.md` § 10). Each widget is offered
 * only to a reader who may see it, loads and fails on its own, and sits in its own error boundary.
 *
 * <p>The header needs only the session and draws at once; a failed settings read still leaves a home — the role's
 * default, and no Edit home to save into.
 */
export const HomeContainer: React.FC = () => {
  const t = useTranslations("home");
  const { access, loading } = useAccess();
  const settings = useUserSettings();
  const [editing, setEditing] = useState(false);

  // A held Approve or task done leaves when Home is left (DECISIONS.md § "The home redesign").
  useEffect(() => () => flushWrites(), []);

  const available = useMemo(() => availableWidgets(access), [access]);
  const role = homeRoleOf(access);
  const stored = useMemo(() => settings.data?.homeLayout ?? [], [settings.data?.homeLayout]);
  const placed = useMemo(() => arrangeHome(available, stored, role), [available, stored, role]);
  // The person's own header, else the company's default from Appearance — the backend has already decided which.
  const header: HomeHeaderStyle = settings.data?.homeHeader === "LIGHT" ? "LIGHT" : "COLOUR";
  const headerDefault: HomeHeaderStyle = settings.data?.homeHeaderDefault === "LIGHT" ? "LIGHT" : "COLOUR";
  const canEdit = !settings.error && !settings.isLoading;
  const openEdit = canEdit ? () => setEditing(true) : undefined;

  if (editing) {
    return (
      <HomeRequestTimeOffProvider>
        <EditHome
          available={available}
          start={placed}
          header={header}
          headerDefault={headerDefault}
          role={role}
          stored={stored}
          onClose={() => setEditing(false)}
        />
      </HomeRequestTimeOffProvider>
    );
  }

  const ready = !loading && !settings.isLoading;

  return (
    <HomeRequestTimeOffProvider>
      {/* The band runs under the page's own padding, edge to edge; Home's own padding is 56 (48 at 1280). */}
      <div className="relative -mx-(--page-padding-narrow) -mt-(--page-padding-narrow) xl:-mx-(--page-padding) xl:-mt-(--page-padding)">
        <HomeBand style={header} />
        <div className="relative mx-auto flex max-w-[1200px] flex-col px-14 pt-14 pb-14 max-[1281px]:px-12 max-[1281px]:pt-12">
          <div className="flex justify-end">
            <ProfileMenu style={header} onEditHome={openEdit} />
          </div>
          <div className="mt-7 flex items-end justify-between gap-10 max-[1281px]:flex-col max-[1281px]:items-start max-[1281px]:gap-6">
            <Greeting style={header} />
            <AiBox onEditHome={openEdit} />
          </div>

          <div className="mt-10">
            {!ready ? (
              <div aria-hidden className="h-[344px]" />
            ) : placed.length === 0 ? (
              <div className="rounded-widget bg-card shadow-widget">
                <EmptyState
                  scene="all-caught-up"
                  title={t("empty.title")}
                  description={t("empty.description")}
                  onCreate={openEdit}
                  createLabel={t("empty.action")}
                />
              </div>
            ) : (
              <WidgetGrid>
                {placed.map(({ widget, size }) => (
                  <WidgetCell key={widget.id} size={size}>
                    <ErrorBoundary>
                      <widget.Component size={size} />
                    </ErrorBoundary>
                  </WidgetCell>
                ))}
              </WidgetGrid>
            )}
          </div>

          {openEdit && placed.length > 0 && (
            <div className="mt-8 flex max-w-[1088px] justify-end">
              <button
                type="button"
                onClick={openEdit}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-pill border border-accent-muted bg-card px-5 text-card-title font-medium text-primary",
                  "transition-colors hover:border-accent-ring hover:bg-subtle",
                )}
              >
                <Icon icon={DashboardSquare01Icon} size="md" />
                {t("header.editHome")}
              </button>
            </div>
          )}
        </div>
      </div>
    </HomeRequestTimeOffProvider>
  );
};
