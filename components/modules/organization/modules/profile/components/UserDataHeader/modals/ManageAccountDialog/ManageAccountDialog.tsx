"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { showActionError, showError, showSuccess } from "@/lib/errors/errorToast";
import { useShortDates, useTimeFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";
import { unlinkPersonFromProviderAction } from "@/components/modules/identity/actions";
import { tryEmailAgainAction } from "@/components/modules/email/actions";
import { endAllSessionsOfUserAction } from "@/components/modules/sessions/actions";
import { sendPasswordResetAction } from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";
import {
  endPersonSessionAction,
  unlinkPersonSignInAccountAction,
} from "@/components/modules/organization/modules/profile/actions/manageAccountActions";
import { exportPersonalData } from "@/components/modules/organization/modules/profile/actions/exportPersonalData";
import {
  AccountAccessModal,
  type AccountAccessKind,
} from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/AccountAccessModal";
import type { PersonSessionDTO, SignInProvider } from "@/api/modules/userAccount/dto";
import type { User } from "@/models/user/User";
import { deviceOf } from "./deviceOf";
import {
  EMAILS_PAGE_SIZE,
  useAccountOverview,
  useInvalidateManageAccount,
  usePersonEmailPages,
  usePersonSessions,
} from "./useManageAccount";

/** Brand names, not words: the same in every language. */
const PROVIDER_NAMES: Record<SignInProvider, string> = { GOOGLE: "Google", MICROSOFT: "Microsoft" };

/** A session seen this recently is "active now". */
const ACTIVE_NOW_MS = 5 * 60 * 1000;

type Props = {
  open: boolean;
  onCloseAction: () => void;
  user: User;
  fullName: string;
  /** After a change the header shows (a block, an unblock, an unlock). */
  onChangedAction: () => void | Promise<unknown>;
};

/**
 * *Manage account* (manage-account spec, MA1–MA6): another person's sign-in in one 800 dialog — how they log in,
 * their devices, the emails sent to them, their data, and blocking. Opened from ⋯ by a holder of `PEOPLE.PROFILE`
 * BLOCK over the person (R13); a row needing another right is hidden — the emails need MANAGE, the export EDIT, the
 * company sign-on link `SETTINGS.IDENTITY` MANAGE. UX only: Java decides every read and every act.
 *
 * Reset two-step login, Block and Unblock open small windows over it (manage-account-answers: AQ-06 with the owner's
 * out-of-band tick, U3; AQ-07 with an optional reason); Unlock keeps its confirm (our lock stays, U2). The rest act at
 * once with a toast. A bounced address is the first row of Login, with "Try again" (AQ-08).
 */
export function ManageAccountDialog({ open, onCloseAction, user, fullName, onChangedAction }: Props) {
  const t = useTranslations("organization");
  const dates = useShortDates();
  const time = useTimeFormatter();
  const { impersonating } = useCurrentUser();
  const canUnlinkSso = useCanAccess("SETTINGS.IDENTITY", "MANAGE");
  const rights = user.capabilities?.["PEOPLE.PROFILE"] ?? [];
  const canSeeEmails = rights.includes("MANAGE");
  // Carrying data out is an EDIT; never inside an impersonation, which Java refuses anyway (P17).
  const canExport = rights.includes("EDIT") && !impersonating;

  const [view, setView] = useState<"main" | "emails">("main");
  const [confirm, setConfirm] = useState<AccountAccessKind | null>(null);
  const [logOutAllOpen, setLogOutAllOpen] = useState(false);
  const [logOutAllBusy, setLogOutAllBusy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const account = useAccountOverview(user.id, open);
  const sessions = usePersonSessions(user.id, open);
  const emails = usePersonEmailPages(user.id, open && canSeeEmails);
  const invalidate = useInvalidateManageAccount();

  useEffect(() => {
    if (!open) setView("main");
  }, [open]);

  const firstName = user.firstName?.trim() || fullName;

  const refresh = async () => {
    await Promise.all([invalidate(user.id), onChangedAction()]);
  };

  /** Acts at once: a toast on success, the card on a refusal. */
  const act = async (key: string, run: () => Promise<ActionResult<unknown>>, success: string | null) => {
    setBusy(key);
    try {
      const res = await run();
      if (res.status === ActionStatus.SUCCESS) {
        if (success) showSuccess(success);
        await refresh();
      } else {
        showActionError(res);
      }
    } finally {
      setBusy(null);
    }
  };

  const exportData = async () => {
    setBusy("export");
    try {
      await exportPersonalData(user.id);
      showSuccess(t("profile.manageAccount.toast.exported"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(null);
    }
  };

  const dateTime = (value: string) =>
    t("profile.manageAccount.dateTime", { date: dates.date(value), time: time(value) });

  const seenWhen = (session: PersonSessionDTO): string => {
    const seen = new Date(session.lastSeenAt);
    const now = new Date();
    if (now.getTime() - seen.getTime() < ACTIVE_NOW_MS) return t("profile.manageAccount.sessions.activeNow");
    if (seen.toDateString() === now.toDateString()) {
      return t("profile.manageAccount.sessions.today", { time: time(session.lastSeenAt) });
    }
    return dateTime(session.lastSeenAt);
  };

  const deviceName = (session: PersonSessionDTO) => {
    const { device, browser } = deviceOf(session.userAgent);
    return {
      device: device ?? t("profile.manageAccount.sessions.unknownDevice"),
      label: t("profile.manageAccount.sessions.device", {
        device: device ?? t("profile.manageAccount.sessions.unknownDevice"),
        browser: browser ?? t("profile.manageAccount.sessions.unknownBrowser"),
      }),
    };
  };

  const overview = account.data;
  const isBlocked = overview?.accountStatus === "BLOCKED";
  // Set to inactive ends the sign-in with a block of its own (U8): the person is Inactive, not Blocked, and comes back
  // through Set to active in the header's ⋯ rather than through Unblock.
  const isInactive = isBlocked && overview?.blockedBy === "INACTIVE";
  const loadFailed = account.isError || sessions.isError;
  const emailPages = emails.data?.pages ?? [];
  const emailTotal = emailPages[0]?.total ?? 0;
  const emailLines = emailPages.flatMap((page) => page.emails);
  const suppression = emailPages[0]?.suppression ?? null;
  const address = emailPages[0]?.address ?? user.email ?? null;

  const header = view === "emails" ? (
    <div className="flex items-start gap-2 px-6 pt-5 pr-14">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="-ml-2 shrink-0"
        aria-label={t("profile.manageAccount.emails.back")}
        onClick={() => setView("main")}
      >
        <Icon icon={ArrowLeft01Icon} size="sm" />
      </Button>
      <div className="min-w-0">
        <DialogTitle>{t("profile.manageAccount.emails.allTitle")}</DialogTitle>
        <DialogDescription className="mt-0.5 truncate text-label font-normal text-tertiary">
          {t("profile.manageAccount.emails.allSub", { count: emailTotal, email: address ?? "" })}
        </DialogDescription>
      </div>
    </div>
  ) : (
    <div className="min-w-0 px-6 pt-5 pr-14">
      <DialogTitle>{t("profile.manageAccount.title")}</DialogTitle>
      <DialogDescription className="mt-0.5 truncate text-label font-normal text-tertiary">
        {user.email ? t("profile.manageAccount.sub", { name: fullName, email: user.email }) : fullName}
      </DialogDescription>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => { if (!next) onCloseAction(); }}>
        <DialogContent size="lg" className="gap-0 p-0">
          {header}

          {loadFailed ? (
            <div className="px-6 pt-6 pb-8">
              <ErrorState
                error={account.error ?? sessions.error}
                title={t("profile.manageAccount.error.title")}
                message={t("profile.manageAccount.error.message")}
                onRetry={() => { void account.refetch(); void sessions.refetch(); }}
              />
            </div>
          ) : view === "emails" ? (
            <div className="max-h-[70vh] overflow-y-auto px-6 pt-5 pb-6">
              {emailLines.map((line) => (
                <div key={line.id} className="flex h-11 items-center gap-4 border-b border-divider">
                  <span className="min-w-0 flex-1 truncate text-body text-primary" title={line.subject}>{line.subject}</span>
                  <span className="shrink-0 text-label font-normal tabular-nums text-tertiary">
                    {dateTime(line.sentAt ?? line.createdAt)}
                  </span>
                </div>
              ))}
              {emails.hasNextPage && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-3 font-medium"
                  loading={emails.isFetchingNextPage}
                  onClick={() => void emails.fetchNextPage()}
                >
                  {t("profile.manageAccount.emails.showMore", {
                    count: Math.min(EMAILS_PAGE_SIZE, emailTotal - emailLines.length),
                  })}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-6 pt-5 pb-6">
              {isBlocked && (
                <div className="flex h-10 shrink-0 items-center gap-2 rounded-popover bg-status-declined-bg px-3">
                  <Icon icon={UnavailableIcon} size="sm" className="size-3.5 text-danger" />
                  <span className="text-body font-semibold text-status-declined-text">
                    {isInactive ? t("profile.manageAccount.blocked.inactive") : t("profile.manageAccount.blocked.label")}
                  </span>
                  <span className="ml-auto truncate text-body text-secondary">
                    {overview?.blockedAt
                      ? t("profile.manageAccount.blocked.on", { date: dates.date(overview.blockedAt) })
                      : t("profile.manageAccount.blocked.noDate")}
                  </span>
                </div>
              )}

              {/* Login */}
              <Section heading={t("profile.manageAccount.login.heading")}>
                {!overview ? <SkeletonRows count={2} /> : (
                  <>
                    {/* Only when an email bounced (AQ-08): Try again lifts the block and sends again at once. */}
                    {suppression && address && (
                      <Row
                        label={t("profile.manageAccount.login.email")}
                        value={t("profile.manageAccount.login.bounced", { date: dates.date(suppression.since), email: address })}
                        action={
                          <RowLink
                            busy={busy === "try-again"}
                            onClick={() => void act(
                              "try-again",
                              () => tryEmailAgainAction(user.id),
                              t("profile.manageAccount.toast.emailSentAgain"),
                            )}
                          >
                            {t("profile.manageAccount.login.tryAgain")}
                          </RowLink>
                        }
                      />
                    )}
                    {overview.password.hasPassword && (
                      <Row
                        label={t("profile.manageAccount.login.password")}
                        value={overview.password.changedAt
                          ? t("profile.manageAccount.login.passwordChanged", { date: dates.date(overview.password.changedAt) })
                          : t("profile.manageAccount.login.passwordSet")}
                        action={overview.accountStatus === "ACTIVE" && (
                          <RowLink
                            busy={busy === "reset"}
                            onClick={() => void act(
                              "reset",
                              () => withStepUpAction(() => sendPasswordResetAction({ userId: user.id })),
                              t("profile.manageAccount.toast.resetSent"),
                            )}
                          >
                            {t("profile.manageAccount.login.sendReset")}
                          </RowLink>
                        )}
                      />
                    )}
                    {(overview.locked || overview.loginRestrictedUntil) && !isBlocked && (
                      <Row
                        label={overview.locked
                          ? t("profile.manageAccount.login.locked")
                          : t("profile.manageAccount.login.paused")}
                        value={overview.locked
                          ? t("profile.manageAccount.login.lockedValue")
                          : t("profile.manageAccount.login.pausedValue", { time: time(overview.loginRestrictedUntil) })}
                        action={
                          <RowLink onClick={() => setConfirm("UNLOCK")}>
                            {t("profile.manageAccount.login.unlock")}
                          </RowLink>
                        }
                      />
                    )}
                    {overview.twoStep.method && (
                      <Row
                        label={t("profile.manageAccount.login.twoStep")}
                        value={t("profile.manageAccount.login.twoStepOn")}
                        action={
                          // A protected account is reset only by a System Owner (MFA_DESIGN.md § 3.8): no Reset the
                          // server would refuse.
                          overview.mayReset && (
                            <RowLink onClick={() => setConfirm("RESET_MFA")}>
                              {t("profile.manageAccount.login.reset")}
                            </RowLink>
                          )
                        }
                      />
                    )}
                    {overview.linkedAccounts.map((linked) => (
                      <Row
                        key={linked.provider}
                        label={PROVIDER_NAMES[linked.provider] ?? linked.provider}
                        value={linked.email ?? ""}
                        action={
                          <RowLink
                            busy={busy === `unlink-${linked.provider}`}
                            onClick={() => void act(
                              `unlink-${linked.provider}`,
                              () => withStepUpAction(() => unlinkPersonSignInAccountAction(user.id, linked.provider)),
                              t("profile.manageAccount.toast.unlinked", {
                                provider: PROVIDER_NAMES[linked.provider] ?? linked.provider,
                              }),
                            )}
                          >
                            {t("profile.manageAccount.login.unlink")}
                          </RowLink>
                        }
                      />
                    ))}
                    {overview.companySso && (
                      <Row
                        label={t("profile.manageAccount.login.sso")}
                        value={t("profile.manageAccount.login.ssoValue")}
                        action={canUnlinkSso && (
                          <RowLink
                            busy={busy === "unlink-sso"}
                            onClick={() => void act(
                              "unlink-sso",
                              () => withStepUpAction(() => unlinkPersonFromProviderAction(user.id)),
                              t("profile.manageAccount.toast.ssoUnlinked"),
                            )}
                          >
                            {t("profile.manageAccount.login.unlink")}
                          </RowLink>
                        )}
                      />
                    )}
                    {!overview.password.hasPassword && !overview.twoStep.method &&
                      overview.linkedAccounts.length === 0 && !overview.companySso && (
                      <Row label={t("profile.manageAccount.login.nothing")} value="" />
                    )}
                  </>
                )}
              </Section>

              {/* Sessions */}
              <Section
                heading={isBlocked || !sessions.data
                  ? t("profile.manageAccount.sessions.headingPlain")
                  : t("profile.manageAccount.sessions.heading", { count: sessions.data.length })}
                action={!isBlocked && (sessions.data?.length ?? 0) > 0 && (
                  <RowLink onClick={() => setLogOutAllOpen(true)}>
                    {t("profile.manageAccount.sessions.logOutEverywhere")}
                  </RowLink>
                )}
              >
                {!sessions.data || !overview ? <SkeletonRows count={2} /> : isBlocked || sessions.data.length === 0 ? (
                  <Row
                    label={t("profile.manageAccount.sessions.none")}
                    value={isBlocked
                      ? t("profile.manageAccount.sessions.noneBlocked")
                      : t("profile.manageAccount.sessions.noneActive")}
                  />
                ) : (
                  sessions.data.map((session) => {
                    const name = deviceName(session);
                    return (
                      // B2: the device and the time; the address it came from is in the tooltip.
                      <Row
                        key={session.id}
                        label={name.label}
                        value={seenWhen(session)}
                        tooltip={session.ip ? t("profile.manageAccount.sessions.ip", { ip: session.ip }) : undefined}
                        action={
                          <RowLink
                            busy={busy === `session-${session.id}`}
                            onClick={() => void act(
                              `session-${session.id}`,
                              () => endPersonSessionAction(user.id, session.id),
                              t("profile.manageAccount.toast.loggedOutOf", { device: name.device }),
                            )}
                          >
                            {t("profile.manageAccount.sessions.logOut")}
                          </RowLink>
                        }
                      />
                    );
                  })
                )}
              </Section>

              {/* Emails sent — PEOPLE.PROFILE MANAGE */}
              {canSeeEmails && (
                <Section
                  heading={emails.data
                    ? t("profile.manageAccount.emails.heading", { count: emailTotal })
                    : t("profile.manageAccount.emails.allTitle")}
                  action={emailTotal > 0 && (
                    <RowLink onClick={() => setView("emails")}>{t("profile.manageAccount.emails.showAll")}</RowLink>
                  )}
                >
                  {emails.isError ? (
                    <ErrorState compact error={emails.error} onRetry={() => void emails.refetch()} />
                  ) : !emails.data ? <SkeletonRows count={3} /> : (
                    <>
                      {emailLines.length === 0 ? (
                        <Row label={t("profile.manageAccount.emails.none")} value="" />
                      ) : (
                        emailLines.slice(0, 3).map((line) => (
                          <Row key={line.id} label={line.subject} value={dateTime(line.sentAt ?? line.createdAt)} />
                        ))
                      )}
                    </>
                  )}
                </Section>
              )}

              {/* Personal data — PEOPLE.PROFILE EDIT */}
              {canExport && (
                <Section heading={t("profile.manageAccount.personalData.heading")}>
                  <Row
                    label={t("profile.manageAccount.personalData.key", { name: firstName })}
                    value={t("profile.manageAccount.personalData.value")}
                    action={
                      <RowLink busy={busy === "export"} onClick={() => void exportData()}>
                        {t("profile.manageAccount.personalData.export")}
                      </RowLink>
                    }
                  />
                </Section>
              )}

              {/* Block or unblock — a separate last block. A draft has no account to block; an inactive person comes back
                  through Set to active. */}
              {overview && overview.accountStatus !== "DRAFT" && !isInactive && (
                <div className="-mt-2 flex items-center gap-4 border-t border-divider pt-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-primary">
                      {isBlocked ? t("profile.manageAccount.unblock.title") : t("profile.manageAccount.block.title")}
                    </p>
                    <p className="truncate text-label font-normal text-tertiary">
                      {isBlocked
                        ? t("profile.manageAccount.unblock.text", { name: firstName })
                        : t("profile.manageAccount.block.text", { name: firstName })}
                    </p>
                  </div>
                  {isBlocked ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setConfirm("UNBLOCK")}>
                      {t("profile.manageAccount.unblock.button")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="border-status-declined-border"
                      onClick={() => setConfirm("BLOCK")}
                    >
                      {t("profile.manageAccount.block.button")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* The small windows over the dialog: Block and Unblock (AQ-07), Reset two-step login (AQ-06, U3), Unlock (U2). */}
      <AccountAccessModal
        kind={confirm}
        userId={user.id}
        fullName={fullName}
        firstName={firstName}
        onCloseAction={() => setConfirm(null)}
        onChangedAction={refresh}
      />

      {/* MA5 — accent, not red: nothing is lost. */}
      <ConfirmActionModal
        isOpen={logOutAllOpen}
        title={t("profile.manageAccount.logOutConfirm.title", { name: firstName })}
        description={t("profile.manageAccount.logOutConfirm.description", { name: firstName })}
        confirmLabel={t("profile.manageAccount.logOutConfirm.confirm")}
        destructive={false}
        isLoading={logOutAllBusy}
        onCancelAction={() => setLogOutAllOpen(false)}
        onConfirmAction={async () => {
          setLogOutAllBusy(true);
          try {
            const res = await endAllSessionsOfUserAction(user.id);
            setLogOutAllOpen(false);
            if (res.status === ActionStatus.SUCCESS) {
              showSuccess(t("profile.manageAccount.toast.loggedOutEverywhere"));
              await invalidate(user.id);
            } else {
              showActionError(res);
            }
          } finally {
            setLogOutAllBusy(false);
          }
        }}
      />
    </>
  );
}

/** A section: a 16/24 heading over a line, an optional link on its right, rows below. */
function Section({ heading, action, children }: {
  heading: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-divider pb-1">
        <h3 className="font-heading text-account-section text-primary">{heading}</h3>
        {action || null}
      </div>
      {children}
    </section>
  );
}

/** A row: key 200 · value · action, a line under it. `tooltip` replaces the value's own title. */
function Row({ label, value, action, tooltip }: {
  label: string;
  value: string;
  action?: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <div className="grid min-h-10 grid-cols-[200px_minmax(0,1fr)_auto] items-center gap-4 border-b border-divider">
      <span className="truncate text-body text-primary" title={label}>{label}</span>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="truncate text-body text-tertiary outline-none">{value}</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="truncate text-body text-tertiary" title={value || undefined}>{value}</span>
      )}
      <span className="justify-self-end">{action || null}</span>
    </div>
  );
}

/** The accent text link of a row or a heading, 13/20 500. */
function RowLink({ onClick, busy = false, children }: { onClick: () => void; busy?: boolean; children: React.ReactNode }) {
  return (
    <Button type="button" variant="link" size="sm" className={cn("font-medium")} loading={busy} onClick={onClick}>
      {children}
    </Button>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="grid min-h-10 grid-cols-[200px_minmax(0,1fr)_auto] items-center gap-4 border-b border-divider">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-40" />
          <span />
        </div>
      ))}
    </>
  );
}
