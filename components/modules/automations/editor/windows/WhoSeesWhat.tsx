"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calendar03Icon, CheckListIcon, InboxIcon, Mail01Icon, UserIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDateFormatter } from "@/lib/date";
import type { RecipientKind, StepExample, StepSpec } from "@/models/automations";
import { usePlaceholderLabel } from "../seams";
import { OTHERWISE } from "@/components/modules/automations/model/tree";

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

/**
 * One place the example lands (the designers' fixes C13): "In Marta's inbox · the manager" 12/16 500 with a 14 icon,
 * then the item as it would look there — a white card, radius 10, 12 inside; an inbox item starts with its sender.
 */
const Place: React.FC<{ icon: IconSvgElement; label: string; sender?: string | null; children: React.ReactNode }> = ({
  icon,
  label,
  sender,
  children,
}) => (
  <div className="flex flex-col gap-2">
    <p className="flex items-center gap-1.5 text-hint font-medium text-secondary">
      <Icon icon={icon} size="sm" className="size-3.5 shrink-0" />
      {label}
    </p>
    <div className="flex flex-col gap-2 rounded-popover border border-divider bg-card p-3">
      {sender != null && (
        <span aria-hidden className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-mist text-hint leading-5 font-medium text-secondary">
          {initials(sender)}
        </span>
      )}
      {children}
    </div>
  </div>
);

/**
 * Who sees what (`automations-editor` → Layout 8, the designers' fixes C12–C13): under the step settings, the step
 * shown on real names in a Mist well — an inbox item, an email, a task, a profile field — headed "Example · nothing is
 * sent". A plain header since the designers' round: it no longer collapses.
 */
export const WhoSeesWhat: React.FC<{
  step: StepSpec;
  example: StepExample | null;
  loading: boolean;
  companyName: string;
  /** A time-off trigger: an approval also shows the request in the asker's time off. */
  timeOff: boolean;
  /**
   * Sample values for an event's own fields, by placeholder (`processName` → "Onboarding"): the example has no event to
   * read them from, and "[Process]" left unfilled read as a bug (the designers' round, 2026-11-18).
   */
  samples?: Record<string, string>;
}> = ({ step, example: given, loading, companyName, timeOff, samples = {} }) => {
  const t = useTranslations("automationsEditor");
  // An event's own fields have no event yet: the backend writes "[leaveStart]" where the value will stand. The reader
  // sees the field's name, as the token chips say it — "[First day off]" — never the key.
  const placeholderLabel = usePlaceholderLabel();
  const example = React.useMemo(() => {
    if (!given) return given;
    const say = (s: string | null | undefined) =>
      s?.replace(/\[([A-Za-z]+)\]/g, (_m, name: string) => samples[name] ?? `[${placeholderLabel(name)}]`) ?? s;
    return { ...given, title: say(given.title) ?? given.title, text: say(given.text) ?? given.text };
    // The samples are compared by what they say: the caller builds a new object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [given, placeholderLabel, JSON.stringify(samples)]);
  const formatDate = useDateFormatter();

  // A02: "by 17 Dec" — the template's days to sign, counted from today (the example's due date).
  const signBy = step.type === "SIGN_DOCUMENT" && example?.dueDate ? formatDate(example.dueDate) : null;
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
    if (step.type === "SPLIT") return <WhoGoesWhere step={step} example={example} />;
    switch (step.type) {
      case "WAIT_UNTIL":
      case "SEND_SURVEY":
        return <p className="text-body text-tertiary">{t("whoSeesWhat.nothingSent")}</p>;
      default:
        break;
    }
    if (!example) return <p className="text-body text-tertiary">{t("whoSeesWhat.waitingForDetails")}</p>;
    switch (step.type) {
      case "SIGN_DOCUMENT":
        // A02: the person's inbox, then a line for the signers after them — their order is the template's.
        return (
          <>
            <Place icon={InboxIcon} label={t("whoSeesWhat.withRole", { place: t("whoSeesWhat.inbox", { name: person }), role: t("whoSeesWhat.role.PERSON") })}>
              {/* A02: the request comes from the company — its tile, 24, radius 6. */}
              <div className="flex items-start gap-2.5">
                <span aria-hidden className="inline-flex size-6 shrink-0 items-center justify-center rounded-tag bg-accent text-hint font-semibold text-on-accent">
                  {initials(companyName).slice(0, 1)}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-body font-medium text-primary">{t("whoSeesWhat.signRequested")}</p>
                  <p className="text-body text-secondary">
                    {signBy
                      ? t("whoSeesWhat.signAsksBy", { company: companyName, document: example.title ?? "", date: signBy })
                      : t("whoSeesWhat.signAsks", { company: companyName, document: example.title ?? "" })}
                  </p>
                </div>
              </div>
            </Place>
            <p className="text-hint text-tertiary">{t("whoSeesWhat.signThen")}</p>
          </>
        );
      case "REQUEST_APPROVAL":
        return (
          <>
            <Place icon={InboxIcon} label={withRole(t("whoSeesWhat.inbox", { name: recipient }))} sender={example.person?.name ?? ""}>
              <p className="text-body text-primary">{example.text ?? example.title}</p>
              <div aria-hidden className="mt-1 flex justify-end gap-2">
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
          <Place icon={InboxIcon} label={withRole(t("whoSeesWhat.inbox", { name: recipient }))} sender={example.person?.name ?? ""}>
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
    <section aria-label={t("whoSeesWhat.title")} data-test="who-sees-what" className="shrink-0 rounded-card border border-divider bg-card shadow-raised">
      {/* C12: a plain header, not a toggle — the eye, the title on one line, the hint on the right. */}
      <header className="flex items-center gap-2 px-5 pt-4 pb-3">
        <Icon icon={ViewIcon} className="shrink-0 text-secondary" />
        <h3 className="whitespace-nowrap text-card-title text-primary">{t("whoSeesWhat.title")}</h3>
        <span className="ml-auto truncate text-hint text-tertiary">{t("whoSeesWhat.example")}</span>
      </header>
      <div className="mx-3 mb-3 flex flex-col gap-2 rounded-popover bg-mist p-3">{body()}</div>
    </section>
  );
};

/**
 * A split's Who sees what (S10, S10b): "Who goes where" — a real person for each path that takes anybody, with the
 * path's name as a tag; before any path has a condition, what to add first.
 */
const WhoGoesWhere: React.FC<{ step: StepSpec; example: StepExample | null | undefined }> = ({ step, example }) => {
  const t = useTranslations("automationsEditor");
  const tShared = useTranslations("automations");
  const paths = step.paths ?? [];
  const nameOf = (key: string): string => {
    if (key === OTHERWISE) return t("canvas.otherwise");
    const i = paths.findIndex((p) => p.id === key);
    return i < 0 ? "" : paths[i].name.trim() || tShared("pathDefault", { n: i + 1 });
  };
  const routes = example?.routes ?? [];
  if (!paths.some((p) => p.condition?.filters?.length) || routes.length === 0) {
    const first = paths[0];
    return (
      <p className="text-hint text-secondary">
        {first ? t("whoSeesWhat.addConditionFirst", { path: nameOf(first.id) }) : t("whoSeesWhat.nothingSent")}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-hint font-medium text-secondary">{t("whoSeesWhat.whoGoesWhere")}</p>
      {routes.map((r) => (
        <div key={r.person.id + ":" + r.path} className="flex items-center gap-2.5 rounded-popover border border-divider bg-card px-2.5 py-2">
          <span aria-hidden className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-mist text-hint leading-5 font-medium text-secondary">
            {initials(r.person.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body text-primary">{r.person.name}</span>
            {r.person.office && <span className="truncate text-hint text-tertiary">{r.person.office}</span>}
          </div>
          <span className="inline-block h-[22px] max-w-32 shrink-0 truncate rounded-tag border border-field px-2 text-hint leading-5 font-medium text-secondary">
            {nameOf(r.path)}
          </span>
        </div>
      ))}
    </div>
  );
};
