"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, ArrowUp01Icon, Calendar03Icon, CheckListIcon, InboxIcon, Mail01Icon, UserIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDateFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { RecipientKind, StepExample, StepSpec } from "@/models/automations";
import { usePlaceholderLabel } from "../seams";
import { readWhoSeesWhatCollapsed, writeWhoSeesWhatCollapsed } from "./whoSeesWhatPreference";

const initials = (name: string | null | undefined) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const firstName = (name: string | null | undefined) => (name ?? "").trim().split(/\s+/)[0] ?? "";

const roleOf = (step: StepSpec): RecipientKind | null => step.assignee?.kind ?? step.recipients?.[0]?.kind ?? null;

/** One place the example lands: "In Marta's inbox · the manager", then the item as it would look there. */
const Place: React.FC<{ icon: IconSvgElement; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="flex flex-col gap-2">
    <p className="flex items-center gap-1.5 text-hint text-secondary">
      <Icon icon={icon} size="sm" className="shrink-0 text-tertiary" />
      {label}
    </p>
    <div className="rounded-popover border border-divider bg-card p-3">{children}</div>
  </div>
);

/**
 * Who sees what (`automations-editor` → Layout 8, J8): under the step settings, the step shown on real names in a Mist
 * well — an inbox item, an email, a task, a profile field — headed "Example · nothing is sent". It collapses to its
 * header, and that choice holds for every step.
 */
export const WhoSeesWhat: React.FC<{
  step: StepSpec;
  example: StepExample | null;
  loading: boolean;
  companyName: string;
  /** A time-off trigger: an approval also shows the request in the asker's time off. */
  timeOff: boolean;
}> = ({ step, example: given, loading, companyName, timeOff }) => {
  const t = useTranslations("automationsEditor");
  // An event's own fields have no event yet: the backend writes "[leaveStart]" where the value will stand. The reader
  // sees the field's name, as the token chips say it — "[First day off]" — never the key.
  const placeholderLabel = usePlaceholderLabel();
  const example = React.useMemo(() => {
    if (!given) return given;
    const say = (s: string | null | undefined) => s?.replace(/\[([A-Za-z]+)\]/g, (_m, name: string) => `[${placeholderLabel(name)}]`) ?? s;
    return { ...given, title: say(given.title) ?? given.title, text: say(given.text) ?? given.text };
  }, [given, placeholderLabel]);
  const formatDate = useDateFormatter();
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => setCollapsed(readWhoSeesWhatCollapsed()), []);
  const toggle = () => {
    setCollapsed((c) => {
      writeWhoSeesWhatCollapsed(!c);
      return !c;
    });
  };

  const role = roleOf(step);
  const recipient = firstName(example?.recipients?.[0]?.name) || t("whoSeesWhat.someone");
  const person = firstName(example?.person?.name) || t("whoSeesWhat.someone");
  const withRole = (place: string) => (role ? t("whoSeesWhat.withRole", { place, role: t(`whoSeesWhat.role.${role}`) }) : place);

  const body = (): React.ReactNode => {
    if (loading && !example) {
      return (
        <div className="flex flex-col gap-2" aria-hidden>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full rounded-popover" />
        </div>
      );
    }
    switch (step.type) {
      case "WAIT_UNTIL":
      case "SPLIT":
      case "SIGN_DOCUMENT":
      case "SEND_SURVEY":
        return <p className="text-body text-tertiary">{t("whoSeesWhat.nothingSent")}</p>;
      default:
        break;
    }
    if (!example) return <p className="text-body text-tertiary">{t("whoSeesWhat.waitingForDetails")}</p>;
    switch (step.type) {
      case "REQUEST_APPROVAL":
        return (
          <>
            <Place icon={InboxIcon} label={withRole(t("whoSeesWhat.inbox", { name: recipient }))}>
              <div className="flex items-start gap-2">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-mist text-hint font-semibold text-secondary">
                  {initials(example.person?.name)}
                </span>
                <p className="text-body text-primary">{example.text ?? example.title}</p>
              </div>
              <div aria-hidden className="mt-3 flex justify-end gap-2">
                <span className="inline-flex h-8 items-center rounded-control border border-field px-3 text-label text-primary">
                  {t("whoSeesWhat.decline")}
                </span>
                <span className="inline-flex h-8 items-center rounded-control bg-accent px-3 text-label text-on-accent">
                  {t("whoSeesWhat.approve")}
                </span>
              </div>
            </Place>
            {timeOff && (
              <Place icon={Calendar03Icon} label={t("whoSeesWhat.timeOff", { name: person })}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body text-primary">{example.title}</p>
                  <StatusBadge status="pending" size="sm" label={t("whoSeesWhat.pending")} />
                </div>
              </Place>
            )}
          </>
        );
      case "NOTIFY":
        return (
          <Place icon={InboxIcon} label={withRole(t("whoSeesWhat.inbox", { name: recipient }))}>
            <p className="text-body text-primary">{example.text ?? example.title}</p>
          </Place>
        );
      case "SEND_EMAIL":
        return (
          <Place icon={Mail01Icon} label={withRole(t("whoSeesWhat.email", { name: recipient }))}>
            <p className="text-body font-medium text-primary">{example.title}</p>
            <p className="mt-1 text-body whitespace-pre-line text-secondary">{example.text}</p>
            <p className="mt-3 border-t border-divider pt-2 text-hint text-tertiary">{t("whoSeesWhat.emailFooter", { company: companyName })}</p>
          </Place>
        );
      case "CREATE_TASK":
      case "START_REVIEW":
        return (
          <Place icon={CheckListIcon} label={withRole(t("whoSeesWhat.tasks", { name: recipient }))}>
            <p className="text-body text-primary">{example.title}</p>
            {example.dueDate && <p className="mt-1 text-hint text-tertiary">{t("whoSeesWhat.due", { date: formatDate(example.dueDate) })}</p>}
          </Place>
        );
      default:
        return (
          <Place icon={UserIcon} label={t("whoSeesWhat.profile", { name: person })}>
            <p className="text-body text-primary">{example.assigns ?? example.title}</p>
          </Place>
        );
    }
  };

  return (
    <section aria-label={t("whoSeesWhat.title")} data-test="who-sees-what" className="rounded-card border border-divider bg-card shadow-popover">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t("whoSeesWhat.expand") : t("whoSeesWhat.collapse")}
        className="flex w-full items-center gap-2 px-5 py-4 text-left outline-none focus-visible:shadow-focus rounded-card"
      >
        <Icon icon={ViewIcon} className="shrink-0 text-secondary" />
        <span className="text-card-title text-primary">{t("whoSeesWhat.title")}</span>
        <span className="ml-auto text-hint text-tertiary">{t("whoSeesWhat.example")}</span>
        <Icon icon={collapsed ? ArrowDown01Icon : ArrowUp01Icon} size="sm" className="shrink-0 text-tertiary" />
      </button>
      <div className={cn("px-3 pb-3", collapsed && "hidden")}>
        <div className="flex flex-col gap-4 rounded-popover bg-mist p-3">{body()}</div>
      </div>
    </section>
  );
};
