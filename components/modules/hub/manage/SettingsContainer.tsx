"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/desact/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { Switch } from "@/components/desact/switch";
import type { HubSettings, HubSettingsWrite } from "@/models/hub";
import { updateHubSettingsAction } from "../actions";
import { hubQueryKeys, unwrapHub, useHubSettings } from "../hooks";
import { HubHeading, HubLoadError, LoadingBlock, PersonAvatar, SkeletonRows } from "../shared";
import { HubPeopleField } from "./audience";
import { ManageFrame } from "./ManageFrame";

const REMINDER_OPTIONS = ["1", "3", "7", "never"] as const;

/** What a partial write does to the settings on screen, so the change shows before the answer arrives. */
export const applySettingsWrite = (settings: HubSettings, write: HubSettingsWrite): HubSettings => ({
  ...settings,
  reminderDaysBefore: write.clearReminder ? null : write.reminderDaysBefore ?? settings.reminderDaysBefore,
  notifyManagerOnMiss: write.notifyManagerOnMiss ?? settings.notifyManagerOnMiss,
  onboardingTask: write.onboardingTask ?? settings.onboardingTask,
  celebrations: {
    enabled: write.celebrationsEnabled ?? settings.celebrations.enabled,
    birthdays: write.celebrateBirthdays ?? settings.celebrations.birthdays,
    anniversaries: write.celebrateAnniversaries ?? settings.celebrations.anniversaries,
    joiners: write.celebrateJoiners ?? settings.celebrations.joiners,
  },
});

/** A setting row: 34 high, the label 13/18 500 over its 12/16 hint (FIXES K3). */
const Row: React.FC<{ label: string; hint: string; children: React.ReactNode; htmlFor?: string }> = ({ label, hint, children, htmlFor }) => (
  <div className="flex min-h-[34px] items-center justify-between gap-6">
    <label htmlFor={htmlFor} className="flex min-w-0 flex-col">
      <span className="text-label text-primary">{label}</span>
      <span className="text-hint text-tertiary">{hint}</span>
    </label>
    {children}
  </div>
);

/**
 * CM04, Settings: who can post and edit pages (the `HUB.CONTENT` grant, through roles and people — CH4), the
 * must-read reminders, celebrations. Every change saves at once; a failure says so with Retry and the control
 * returns to what it was. The News block waits for the Company news widget (Q-12).
 */
export const SettingsContainer: React.FC = () => {
  const t = useTranslations("hub");
  const queryClient = useQueryClient();
  const settings = useHubSettings();
  const s = settings.data;

  const save = async (write: HubSettingsWrite) => {
    const before = queryClient.getQueryData<HubSettings>(hubQueryKeys.settings);
    if (before && !write.editorRoleIds && !write.editorUserIds) {
      queryClient.setQueryData(hubQueryKeys.settings, applySettingsWrite(before, write));
    }
    try {
      const next = unwrapHub(await updateHubSettingsAction(write));
      queryClient.setQueryData(hubQueryKeys.settings, next);
      void queryClient.invalidateQueries({ queryKey: ["HUB", "HOME"] });
    } catch {
      if (before) queryClient.setQueryData(hubQueryKeys.settings, before);
      toast.error(t("settings.saveFailed"), { action: { label: t("page.retry"), onClick: () => void save(write) } });
    }
  };

  const fixedRoles = (s?.editors.roles ?? []).filter((r) => !r.editableHere);
  const editableRoleIds = (s?.editors.roles ?? []).filter((r) => r.editableHere).map((r) => r.id);
  const peopleIds = (s?.editors.people ?? []).map((p) => p.id);

  return (
    <ManageFrame>
      <div className="flex max-w-[720px] flex-col">
        {settings.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={6} height="h-12" />} />
        ) : settings.isError || !s ? (
          <HubLoadError error={settings.error} title={t("settings.error")} onRetry={() => void settings.refetch()} />
        ) : (
          <>
            {/* Headings 16 above their first row (FIXES K1). */}
            <section className="flex flex-col gap-4 pb-8">
              <HubHeading>{t("settings.editors")}</HubHeading>
              {/* One field, 42 high, padding 6 8, 6 between: the roles that always stay are chips without ×, then the
                  people and roles added here (FIXES K2). */}
              <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-control border border-field bg-card px-2 py-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus">
                {fixedRoles.map((role) => (
                  <span key={role.id} className="inline-flex h-7 items-center gap-1.5 rounded-pill bg-mist pr-1.5 pl-1 text-hub-small text-primary">
                    <PersonAvatar person={{ name: role.name, avatarUrl: null }} size={20} />
                    {role.name}
                  </span>
                ))}
                <div className="min-w-48 flex-1 [&>div]:min-h-7 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
                  <HubPeopleField
                    ariaLabel={t("settings.addEditor")}
                    placeholder={t("settings.addEditor")}
                    value={{ roleIds: editableRoleIds, userIds: peopleIds }}
                    onChange={(next) => void save({ editorRoleIds: [...next.roleIds, ...fixedRoles.map((r) => r.id)], editorUserIds: next.userIds })}
                  />
                </div>
              </div>
              <p className="text-hint text-tertiary">{t("settings.editorsHint")}</p>
            </section>

            <section className="flex flex-col gap-4 border-t border-divider py-8">
              <HubHeading>{t("settings.mustRead")}</HubHeading>
              <Row label={t("settings.remind")} hint={t("settings.remindHint")}>
                <Select
                  value={s.reminderDaysBefore === null ? "never" : String(s.reminderDaysBefore)}
                  onValueChange={(v) => void save(v === "never" ? { clearReminder: true } : { reminderDaysBefore: Number(v) })}
                >
                  {/* 160, white, the chevron Ink (FIXES K4). */}
                  <SelectTrigger className="w-40 bg-card [&_svg]:text-primary" aria-label={t("settings.remind")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o === "never" ? t("settings.dontRemind") : o === "7" ? t("settings.weekBefore") : t("settings.daysBefore", { count: Number(o) })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.tellManager")} hint={t("settings.tellManagerHint")} htmlFor="hub-tell-manager">
                <Switch
                  id="hub-tell-manager"
                  aria-label={t("settings.tellManagerName")}
                  checked={s.notifyManagerOnMiss}
                  onCheckedChange={(v) => void save({ notifyManagerOnMiss: v })}
                />
              </Row>
              <Row label={t("settings.onboarding")} hint={t("settings.onboardingHint")} htmlFor="hub-onboarding">
                <Switch id="hub-onboarding" aria-label={t("settings.onboardingName")} checked={s.onboardingTask} onCheckedChange={(v) => void save({ onboardingTask: v })} />
              </Row>
            </section>

            <section className="flex flex-col gap-4 border-t border-divider pt-8">
              <div className="flex items-center justify-between">
                <HubHeading>{t("settings.celebrations")}</HubHeading>
                <Switch
                  aria-label={t("settings.showCelebrations")}
                  checked={s.celebrations.enabled}
                  onCheckedChange={(v) => void save({ celebrationsEnabled: v })}
                />
              </div>
              {/* In one row, 24 apart, 8 from the box to its word (FIXES K5). Off, the kinds are not offered at all. */}
              {s.celebrations.enabled && (
                <div className="flex flex-wrap items-center gap-6">
                  {(
                    [
                      ["celebrateBirthdays", "birthdays", t("settings.birthdays")],
                      ["celebrateAnniversaries", "anniversaries", t("settings.anniversaries")],
                      ["celebrateJoiners", "joiners", t("settings.joiners")],
                    ] as const
                  ).map(([write, read, label]) => (
                    <label key={write} className="flex items-center gap-2 text-body text-primary">
                      <Checkbox checked={s.celebrations[read]} onCheckedChange={(v) => void save({ [write]: v === true })} />
                      {label}
                    </label>
                  ))}
                </div>
              )}
              <p className="text-hint text-tertiary">{t("settings.celebrationsHint")}</p>
            </section>

            {/* No hairline; 24 under the last block (FIXES K6). */}
            <p className="mt-6 text-hint text-tertiary">{t("settings.autosave")}</p>
          </>
        )}
      </div>
    </ManageFrame>
  );
};
