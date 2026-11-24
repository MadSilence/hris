"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { useAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { cn } from "@/lib/cn";
import type { HomeHeaderStyle } from "@/models/home";
import { availableWidgets, homeRoleOf } from "@/components/modules/home/widgets";
import { arrangeHome } from "@/components/modules/home/layout";
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
  const [askOpen, setAskOpen] = useState(false);

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
      {/*
        * The band runs under the page's own padding, edge to edge — always the full width of the page, never the
        * container's. Home's own padding is 56 (48 at 1280); inside it the header and the grid share one container,
        * the full width up to 1200 and centred beyond (the designers' Home fixes, Part 3). Narrow is the container
        * under 1000 px: three columns, and the AI box under the greeting.
        */}
      <div className="relative -mx-(--page-padding-narrow) -mt-(--page-padding-narrow) xl:-mx-(--page-padding) xl:-mt-(--page-padding)">
        <HomeBand style={header} />
        <div className="relative px-14 pt-14 pb-14 max-[1281px]:px-12 max-[1281px]:pt-12">
        <div className="@container mx-auto flex w-full max-w-[1200px] flex-col">
          <div className="flex justify-end">
            <ProfileMenu style={header} />
          </div>
          <div className="relative mt-7 flex items-end justify-between gap-10 @max-[999px]:flex-col @max-[999px]:items-start @max-[999px]:gap-6">
            <Greeting style={header} faded={askOpen} />
            <AiBox onEditHome={openEdit} onOpenChange={setAskOpen} />
          </div>

          <div className="mt-10">
            {!ready ? (
              <div aria-hidden className="h-[344px]" />
            ) : (
              <WidgetGrid>
                {placed.map(({ widget, size, col, row }) => (
                  <WidgetCell key={widget.id} size={size} col={col} row={row}>
                    <ErrorBoundary>
                      <widget.Component size={size} />
                    </ErrorBoundary>
                  </WidgetCell>
                ))}
              </WidgetGrid>
            )}
          </div>

          {/* Never empty: Waiting on you cannot be removed and is everybody's (WALK_QUESTIONS § 35 (a)). */}
          {openEdit && (
            <div className="mt-8 flex justify-end">
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
      </div>
    </HomeRequestTimeOffProvider>
  );
};
