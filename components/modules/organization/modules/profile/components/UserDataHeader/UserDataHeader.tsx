"use client";

import { SampleBadge, useIsDemo } from "@/components/modules/demo";
import { InlineAlert } from "@/components/desact/alert";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteProfileModal } from "./modals/DeleteProfileModal";
import { useSWRConfig } from "swr";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { canBeInvited } from "@/models/user/status";
import { useDateFormatter, useShortDates } from "@/lib/date";
import { useRouter } from "next/navigation";
import { WaitingOnYou } from "@/components/modules/organization/modules/profile/components/WaitingOnYou";
import Link from "next/link";
import { Button } from "@/components/desact/button";
import { RowAction, RowActionDestructive, RowActionSeparator, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ArrowRight02Icon, Calendar03Icon, Cancel01Icon, HierarchySquare02Icon, Delete02Icon, Key01Icon, Login03Icon, Logout03Icon, Mail01Icon, PencilEdit02Icon, Rocket01Icon, UnavailableIcon, UserAccountIcon, UserCheck01Icon, UserMultipleIcon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCanAccess } from "@/components/auth/useAccess";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { leaveClasses } from "@/lib/theme/leave";
import { ChangePasswordModal } from "@/components/modules/auth/components/ChangePasswordModal";
import { ManageAccountDialog } from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/ManageAccountDialog";
import { usePersonAbsenceSummary } from "@/components/modules/organization/modules/profile/hooks/usePersonAbsenceSummary";
import { accountPillOf, nameStatusOf, setActiveDescriptionKey, type AccountPill, type NameStatus, type ReturnDays } from "./headerStatus";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { expandSpanToDays, nonWorkingDayTest } from "@/components/modules/calendar/lib/dateRange";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useStartImpersonation } from "@/components/modules/auth/impersonation/hooks/useStartImpersonation";
import {
  cancelInviteAction,
  deleteUserAction,
  setActiveAction,
  setInactiveAction,
  terminateUserAction,
} from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { InviteUserModal } from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/InviteUserModal";
import { showSuccess } from "@/lib/errors/errorToast";
import { StartProcessModal } from "@/components/modules/lifecycle/start/StartProcessModal";
import type { ProcessType } from "@/models/lifecycle";
import {
  TerminateEmploymentModal,
} from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/TerminateEmploymentModal";
import {
  UpdateUserAvatarModal,
  UpdateUserAvatarSubmission,
} from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/UpdateUserAvatarModal";
import { useUploadUserAvatar } from "@/components/modules/organization/modules/profile/hooks/useUploadUserAvatar";
import { useDeleteUserAvatar } from "@/components/modules/organization/modules/profile/hooks/useDeleteUserAvatar";
import {
  useInvalidateUserScheduledChanges,
  useUserScheduledChanges,
} from "@/components/modules/organization/modules/profile/hooks/useUserScheduledChanges";
import { ScheduledChangesPanel } from "@/components/modules/organization/modules/profile/components/ScheduledChanges";
import { isProspectiveStatus } from "@/models/user/status";

export type UserDataHeaderProps = {
  userId: string;
  user?: User;
};

type OrgTranslator = ReturnType<typeof useTranslations<"organization">>;

export function UserDataHeader({ userId, user: userProp }: UserDataHeaderProps) {
  const t = useTranslations("organization");
  const shortDates = useShortDates();
  const tDemo = useTranslations("demo.sample");
  const isDemo = useIsDemo();
  const { data: userFetched } = useUser(userId);
  const user = userFetched ?? userProp;
  // The profile's SWR cache is its own (`UserProvider` sets `provider: () => new Map()`), so the
  // global `mutate` from "swr" never reached it: an invite, a block or a termination succeeded and the
  // header kept the old status until a reload. The provider's own `mutate` is the one that revalidates.
  const { mutate } = useSWRConfig();

  const { userId: currentUserId, impersonating } = useCurrentUser();
  const router = useRouter();

  // Booking someone else's leave is a time-off action, not a profile one.

  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [statusChange, setStatusChange] = useState<"inactive" | "active" | null>(null);
  const [isCancelInviteOpen, setIsCancelInviteOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [startType, setStartType] = useState<ProcessType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isLifecycleBusy, setIsLifecycleBusy] = useState(false);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Above the early return: hooks are counted per render.
  const canManageProfiles = useCanAccess("PEOPLE.PROFILE", "MANAGE");
  const canImpersonate = useCanAccess("SETTINGS.IMPERSONATION", "MANAGE");
  // "Back" and the next leave (R12) are read under the board's gate; without it nothing is asked.
  const canSeeCalendar = useCanAccess("PEOPLE.CALENDAR", "VIEW");
  const { data: absences } = usePersonAbsenceSummary(userId, canSeeCalendar);
  // "Back {first working day}" counts as the leave card does (W14): the company's week and the person's holidays,
  // asked only while they are off.
  const { company } = useCompanyData();
  const { data: holidayRows } = useUserPublicHolidays({ userId: absences?.current ? userId : "" });
  const returnDays = React.useMemo<ReturnDays>(
    () => ({
      isNonWorking: nonWorkingDayTest(company?.workingDays),
      holidays: new Set((holidayRows ?? []).flatMap((h) => expandSpanToDays(h.holidayDate, h.endDate))),
    }),
    [company?.workingDays, holidayRows],
  );
  // Java lists only what this reader may act on, so a reader who may only view gets none.
  const { data: scheduledChanges } = useUserScheduledChanges(userId);
  const invalidateScheduledChanges = useInvalidateUserScheduledChanges();

  const localAvatarUrlRef = useRef<string | null>(null);

  const startImpersonation = useStartImpersonation();
  const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } = useUploadUserAvatar();
  const { mutateAsync: deleteAvatar, isPending: isDeletingAvatar } = useDeleteUserAvatar();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarOverrideUrl, setAvatarOverrideUrl] = useState<string | null | undefined>(undefined);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const isAvatarLoading = isUploadingAvatar || isDeletingAvatar;

  useEffect(() => {
    return () => {
      revokeLocalAvatarUrl();
    };
  }, []);

  const revokeLocalAvatarUrl = () => {
    if (localAvatarUrlRef.current) {
      URL.revokeObjectURL(localAvatarUrlRef.current);
      localAvatarUrlRef.current = null;
    }
  };

  /**
   * Two refreshes on purpose. The SWR key backs client consumers, but the header itself renders the
   * user object handed down from the server layout — so without re-running the server render a
   * successful termination just closed the modal and left the old data on screen.
   */
  const refreshUser = async (targetUserId: string) => {
    const result = await mutate<User>(`/api/users/${targetUserId}`);
    router.refresh();
    return result;
  };

  const handleAvatarConfirm = async (submission: UpdateUserAvatarSubmission) => {
    if (!user?.id) return;

    // The dialog stays open on failure and says why. Before this, a refused avatar change closed the
    // dialog and reached the console only — the same defect fixed twice already elsewhere.
    setAvatarError(null);

    try {
      if (submission.action === "upload") {
        revokeLocalAvatarUrl();

        const localAvatarUrl = URL.createObjectURL(submission.file);
        localAvatarUrlRef.current = localAvatarUrl;

        await uploadAvatar({
          userId: user.id,
          file: submission.file,
        });

        setAvatarOverrideUrl(localAvatarUrl);
        setAvatarVersion(Date.now());

        await refreshUser(user.id);

        setIsAvatarModalOpen(false);
        return;
      }

      await deleteAvatar({
        userId: user.id,
      });

      revokeLocalAvatarUrl();
      setAvatarOverrideUrl(null);
      setAvatarVersion(Date.now());

      await refreshUser(user.id);

      setIsAvatarModalOpen(false);
    } catch (error) {
      revokeLocalAvatarUrl();
      setAvatarOverrideUrl(undefined);
      setAvatarError(messageForError(error));
    }
  };

  if (!user) {
    return (
      <div className="px-8">
        <header className="py-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
            <div className="w-28 h-28 rounded-pill bg-mist shimmer"/>
            <div className="space-y-3">
              <div className="h-7 w-56 bg-mist rounded-tag shimmer"/>
              <div className="h-4 w-72 bg-mist rounded-tag shimmer"/>
            </div>
            <div className="h-9 w-28 bg-mist rounded-control shimmer"/>
          </div>
        </header>
      </div>
    );
  }

  // Identity always arrives; the email may be withheld by field access, so it cannot be the last
  // resort. An unnamed person is a data problem, not a permission one.
  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || t("profile.header.unnamed");
  const isOwnProfile = currentUserId === user.id;
  const isArchived = (user.status ?? "").toUpperCase() === "ARCHIVED";
  /*
   * A termination date is written when the termination is *scheduled*, and the effects land the day
   * after it. Reading the date alone labelled a person still coming to work "Already Terminated" — the
   * opposite of the truth. Applied means archived; a date without that is pending.
   */
  const isTerminationPending = !!user.terminationDate && !isArchived;
  /**
   * A draft is a name in a table: no account, no employment, no history. The header used to offer it
   * everything an employee gets — sign in as them, terminate their employment — and every one of
   * those either refuses or means nothing. What a draft can do is Invite, Edit and Delete.
   */
  const isDraft = user.accountStatus === "DRAFT";
  // Offered while nobody has set a password yet. The profile is the one place a draft is reachable.
  // A demo invites nobody (R5.5): its people are samples, and Java refuses it (BIL00010).
  const mayInvite = !isOwnProfile && !isArchived && canBeInvited(user.accountStatus) && !isDemo;
  const isInvited = user.accountStatus === "INVITED";
  const firstName = user.firstName?.trim() || fullName;
  /*
   * The ⋯ per status (AQ-08, U8): a person is Draft (not invited yet), Joining (invited), Active (also with a last
   * day ahead) or Inactive (archived — by hand, or after the last day). Every item is shown only where it can act.
   */
  const menuStatus: "draft" | "joining" | "active" | "inactive" =
    isArchived ? "inactive" : isDraft ? "draft" : isInvited ? "joining" : "active";
  const rights = user.capabilities?.["PEOPLE.PROFILE"] ?? [];
  // Preboarding is for somebody with no account; onboarding for somebody who is in the system.
  const mayPreboard = canManageProfiles && !isOwnProfile && (menuStatus === "draft" || menuStatus === "joining");
  const mayOnboard = canManageProfiles && !isOwnProfile && (menuStatus === "joining" || menuStatus === "active");
  // An offboarding counts from the last working day, so it needs the termination recorded — before or after
  // the day itself (DECISIONS.md § "Lifecycle tasks", D1).
  const mayOffboard = canManageProfiles && !isOwnProfile && menuStatus === "active" && Boolean(user.terminationDate);
  // BLOCK is scoped on the person, so the server's per-target answer decides — not "do I hold it anywhere". Never on
  // the own profile: blocking yourself is refused (U00010). Everything sign-in lives in Manage account (R13); a draft
  // has no account to manage.
  const mayManageAccount = !isOwnProfile && menuStatus !== "draft" && rights.includes("BLOCK");
  // Only somebody with a password to sign in with can be impersonated: an Active person whose account is open.
  const mayImpersonate = !isOwnProfile && menuStatus === "active" && user.accountStatus === "ACTIVE" && canImpersonate;
  // Employment is ended once: while a termination waits, Last day beside the name says so.
  const mayTerminate = canManageProfiles && !isOwnProfile && menuStatus === "active" && !isTerminationPending;
  // Set to inactive archives without a termination (U8): a person who never worked, or was added by mistake.
  const maySetInactive = canManageProfiles && !isOwnProfile && menuStatus === "active";
  const maySetActive = canManageProfiles && !isOwnProfile && menuStatus === "inactive";
  // Delete is offered for a draft and for an inactive person (U8; DELETION.md applies).
  const mayDelete = canManageProfiles && !isOwnProfile && (menuStatus === "draft" || menuStatus === "inactive");
  // A scheduled invitation is withdrawn; one already sent is revoked — its link stops working and the person is a
  // draft again (C4).
  const mayCancelInvitation = canManageProfiles && !isOwnProfile && !isArchived &&
    (Boolean(user.inviteScheduledFor) || isInvited);
  // Your own password, on your own profile — and not while impersonating. The screen says "own profile" because the
  // session is that person, but the human at the keyboard is somebody else, and the dialog would ask for a password
  // they do not have and must not set. Your own data is exported from your preferences (B4), not from here.
  const mayChangeOwnPassword = isOwnProfile && !impersonating;
  const secondGroup = (mayOnboard && menuStatus === "active") || mayOffboard || mayTerminate || maySetInactive ||
    maySetActive || mayCancelInvitation;
  // View in org chart is always there, so the menu shows whenever anything else would.
  const hasPersonActions = mayImpersonate || mayManageAccount || mayChangeOwnPassword || mayPreboard || mayOnboard ||
    secondGroup || mayDelete;

  const teamFact = user.teams && user.teams.length > 0
    ? { label: t("profile.header.teams", { count: user.teams.length }), value: user.teams.map((team) => team.name).join(", ") }
    : user.department?.name
      ? { label: t("profile.header.department"), value: user.department.name }
      : null;
  const tenure = tenureOf(t, user.hireDate);
  // Before the first day the fact reads "—", with no tooltip (QR3); with no start date at all it is not shown.
  const notStartedYet = !tenure && Boolean(user.hireDate);
  const nameStatus = nameStatusOf(user, absences, undefined, returnDays);
  const accountPill = accountPillOf(user);

  const rawAvatarUrl =
    avatarOverrideUrl !== undefined ? avatarOverrideUrl : user.avatarUrl ?? null;

  const avatarUrl = rawAvatarUrl ? withCacheBust(rawAvatarUrl, avatarVersion) : null;

  return (
    <div>
      <header className="pb-6">
        {/* One row (the product-wide header, QR3): the photo, the name with one status beside it over the job title,
            the facts with their round marks, the account pill and the actions on the right. */}
        <div className="flex items-center gap-6">
          {/* Own photo is always editable; someone else's needs profile EDIT. The pencil shows on hover and
              focus only; on a touch screen, which has no hover, it stays as a small badge in the corner. */}
          <PermissionGate
            resource={isOwnProfile ? undefined : "PEOPLE.PROFILE"}
            action="EDIT"
            fallback={<ProfileAvatar url={avatarUrl} fullName={fullName} />}
          >
            <button
              type="button"
              aria-label={t("profile.header.changePhoto")}
              disabled={isAvatarLoading}
              onClick={() => setIsAvatarModalOpen(true)}
              className="group relative shrink-0 rounded-pill"
            >
              <ProfileAvatar url={avatarUrl} fullName={fullName} />
              <span
                aria-hidden
                className={[
                  "absolute inset-0 grid place-items-center rounded-pill bg-inverse/35 text-on-inverse opacity-0",
                  "transition-opacity duration-(--duration-hover) group-hover:opacity-100 group-focus-visible:opacity-100",
                  "pointer-coarse:inset-auto pointer-coarse:-right-0.5 pointer-coarse:-bottom-0.5 pointer-coarse:size-[18px]",
                  "pointer-coarse:border pointer-coarse:border-divider pointer-coarse:bg-card pointer-coarse:text-tertiary pointer-coarse:opacity-100",
                ].join(" ")}
              >
                <Icon icon={PencilEdit02Icon} size="sm" className="pointer-coarse:size-[11px]" />
              </span>
            </button>
          </PermissionGate>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-12 gap-y-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3.5">
                <h1
                  title={fullName}
                  className={cn("truncate font-heading text-profile-name", isArchived ? "text-secondary" : "text-primary")}
                >
                  {fullName}
                </h1>
                {/* Sample is said only in a demo (R14: a person added by hand is real). */}
                {isDemo && user.isSample && <SampleBadge />}
                {nameStatus && <NameStatusMark status={nameStatus} userId={user.id} />}
              </div>
              {user.jobName && <p className="mt-2 truncate text-profile-job text-secondary">{user.jobName}</p>}
            </div>

            <div className="flex min-w-0 items-center gap-12">
              {user.manager && (
                <HeaderFact
                  label={t("profile.header.manager")}
                  mark={
                    <Avatar className="size-9">
                      <AvatarFallback name={user.manager.name} className="text-hint">{initialsOf(user.manager.name)}</AvatarFallback>
                    </Avatar>
                  }
                >
                  <Link href={`/organization/people/${user.manager.id}`} className="text-primary no-underline hover:underline">
                    {user.manager.name}
                  </Link>
                </HeaderFact>
              )}
              {teamFact && (
                <HeaderFact label={teamFact.label} mark={<FactIcon icon={UserMultipleIcon} />}>
                  {teamFact.value}
                </HeaderFact>
              )}
              {tenure && (
                <HeaderFact label={t("profile.header.withUs")} mark={<FactIcon icon={Calendar03Icon} />}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="cursor-default outline-none" suppressHydrationWarning>{tenure}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("profile.header.since", { date: shortDates.date(user.hireDate) })}
                    </TooltipContent>
                  </Tooltip>
                </HeaderFact>
              )}
              {notStartedYet && (
                <HeaderFact label={t("profile.header.withUs")} mark={<FactIcon icon={Calendar03Icon} />}>—</HeaderFact>
              )}
            </div>
          </div>

          {/*
            The account pill, then the actions. Only actions with something behind them: Share and "Set a reminder"
            were removed with the other stubs and deliberately not brought back. No Edit here — editing stays per tab.
          */}
          <div className="flex shrink-0 items-center gap-6 lg:ml-8">
            {accountPill && <AccountPillMark pill={accountPill} />}

            <div className="flex items-center gap-2">
              {/* The main button while the person has no account (QR3s). */}
              {mayInvite && (
                <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
                  <Button type="button" className="gap-1.5" onClick={() => setIsInviteOpen(true)}>
                    <Icon icon={Mail01Icon} size="sm" />
                    {isInvited ? t("profile.header.resendInvitation") : t("profile.header.invite")}
                  </Button>
                </PermissionGate>
              )}

              {/*
                Two rights meet in this menu: MANAGE for the record, BLOCK for sign-in. Somebody holding
                only BLOCK — a security officer, say — still gets the menu, with View in org chart and Manage account.
              */}
              {hasPersonActions && (
                <RowActionsMenu label={t("profile.header.personActions")} trigger="secondary">
                  {/* The chart opens with this person picked and centred (`?person=`). Shown whenever the menu is. */}
                  <RowAction
                    icon={<Icon icon={HierarchySquare02Icon} size="sm" />}
                    onClick={() => router.push(`/organization/chart?person=${encodeURIComponent(user.id)}`)}
                  >
                    {t("profile.header.viewInOrgChart")}
                  </RowAction>
                  {/* Out of the header and into the menu (P6). */}
                  {mayImpersonate && (
                    <RowAction
                      icon={<Icon icon={Login03Icon} size="sm" />}
                      onClick={() => { if (!startImpersonation.isPending) startImpersonation.mutate({ targetUserId: user.id }); }}
                    >
                      {t("profile.header.loginAsName", { name: firstName })}
                    </RowAction>
                  )}
                  {/* Sign-in, sessions, emails, the data export and blocking live in one dialog (MA, R13). */}
                  {mayManageAccount && (
                    <RowAction icon={<Icon icon={UserAccountIcon} size="sm" />} onClick={() => setIsManageAccountOpen(true)}>
                      {t("profile.header.manageAccount")}
                    </RowAction>
                  )}
                  {/* In the kebab like every other action on a profile — the own one is no exception. */}
                  {mayChangeOwnPassword && (
                    <RowAction icon={<Icon icon={Key01Icon} size="sm" />} onClick={() => setIsChangePasswordOpen(true)}>
                      {t("profile.header.changePassword")}
                    </RowAction>
                  )}
                  {mayPreboard && (
                    <RowAction icon={<Icon icon={ArrowRight02Icon} size="sm" />} onClick={() => setStartType("PREBOARDING")}>
                      {t("profile.header.startPreboarding")}
                    </RowAction>
                  )}
                  {mayOnboard && menuStatus === "joining" && (
                    <RowAction icon={<Icon icon={Rocket01Icon} size="sm" />} onClick={() => setStartType("ONBOARDING")}>
                      {t("profile.header.startOnboarding")}
                    </RowAction>
                  )}

                  {secondGroup && <RowActionSeparator />}
                  {mayOnboard && menuStatus === "active" && (
                    <RowAction icon={<Icon icon={Rocket01Icon} size="sm" />} onClick={() => setStartType("ONBOARDING")}>
                      {t("profile.header.startOnboarding")}
                    </RowAction>
                  )}
                  {mayOffboard && (
                    <RowAction icon={<Icon icon={Logout03Icon} size="sm" />} onClick={() => setStartType("OFFBOARDING")}>
                      {t("profile.header.startOffboarding")}
                    </RowAction>
                  )}
                  {/* Ink text with a red icon (AQ-08 "cau"): it ends something, and it can be undone. */}
                  {mayTerminate && (
                    <RowAction
                      icon={<Icon icon={UnavailableIcon} size="sm" className="text-danger-text" />}
                      onClick={() => setIsTerminateOpen(true)}
                    >
                      {t("profile.header.terminate")}
                    </RowAction>
                  )}
                  {maySetInactive && (
                    <RowAction
                      icon={<Icon icon={UserRemove01Icon} size="sm" className="text-danger-text" />}
                      title={t("profile.header.setInactiveHint")}
                      onClick={() => setStatusChange("inactive")}
                    >
                      {t("profile.header.setInactive")}
                    </RowAction>
                  )}
                  {maySetActive && (
                    <RowAction icon={<Icon icon={UserCheck01Icon} size="sm" />} onClick={() => setStatusChange("active")}>
                      {t("profile.header.setActive")}
                    </RowAction>
                  )}
                  {mayCancelInvitation && (
                    <RowAction
                      icon={<Icon icon={Cancel01Icon} size="sm" className="text-danger-text" />}
                      onClick={() => setIsCancelInviteOpen(true)}
                    >
                      {t("profile.header.cancelInvitation")}
                    </RowAction>
                  )}
                  {mayDelete && (
                    <RowActionDestructive
                      icon={<Icon icon={Delete02Icon} size="sm" />}
                      onClick={() => setIsDeleteOpen(true)}
                    >
                      {t("profile.header.deleteProfile")}
                    </RowActionDestructive>
                  )}
                </RowActionsMenu>
              )}
            </div>
          </div>
        </div>

        <LifecycleNote user={user} startsShown={nameStatus?.kind === "starts"} />

        <div className="mt-2 -ml-2 empty:hidden">
          <ScheduledChangesPanel
            userId={user.id}
            changes={scheduledChanges ?? []}
            onChangedAction={() => refreshUser(user.id)}
          />
        </div>

        {/* A sample person is deleted when the company goes live (R5.4): said before anybody spends time on them. */}
        {user.isSample && (
          <InlineAlert className="mt-5">{tDemo("warning")}</InlineAlert>
        )}

        {/* What the reader has to do about this person (B5). Never on your own profile: nothing waits on you there. */}
        {!isOwnProfile && (
          <div className="mt-5">
            <WaitingOnYou userId={user.id} firstName={user.firstName ?? fullName} />
          </div>
        )}
      </header>

      <UpdateUserAvatarModal
        isOpen={isAvatarModalOpen}
        isLoading={isAvatarLoading}
        fullName={fullName}
        avatarUrl={avatarUrl}
        errorMessage={avatarError}
        onConfirmAction={handleAvatarConfirm}
        onRequestCloseAction={() => {
          setAvatarError(null);
          setIsAvatarModalOpen(false);
        }}
      />

      {mayManageAccount && (
        <ManageAccountDialog
          open={isManageAccountOpen}
          onCloseAction={() => setIsManageAccountOpen(false)}
          user={user}
          fullName={fullName}
          onChangedAction={() => refreshUser(user.id)}
        />
      )}

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onCloseAction={() => setIsChangePasswordOpen(false)}
      />

      <StartProcessModal
        open={startType !== null}
        type={startType ?? "PREBOARDING"}
        userId={user.id}
        fullName={fullName}
        lineManager={user.manager ? { id: user.manager.id, name: user.manager.name } : null}
        onCloseAction={() => setStartType(null)}
      />

      <InviteUserModal
        open={isInviteOpen}
        userId={user.id}
        fullName={fullName}
        email={user.email ?? null}
        isResend={isInvited}
        onCloseAction={() => setIsInviteOpen(false)}
        onInvitedAction={async (state) => {
          // A scheduled invite left the header on "Not invited" until a reload (walk, SWEEP S11). The
          // answer already says where the invitation stands: write it into the cache at once, then
          // refetch the person and the scheduled changes the invite is one of — as termination does.
          if (state) {
            await mutate<User>(
              `/api/users/${user.id}`,
              (current) => current && {
                ...current,
                accountStatus: state.accountStatus,
                inviteSentAt: state.inviteSentAt,
                inviteScheduledFor: state.scheduledFor,
              },
              { revalidate: false },
            );
          }
          await Promise.all([refreshUser(user.id), invalidateScheduledChanges(user.id)]);
        }}
      />

      <TerminateEmploymentModal
        isOpen={isTerminateOpen}
        userId={user.id}
        fullName={fullName}
        isLoading={isLifecycleBusy}
        errorMessage={lifecycleError}
        onCancelAction={() => {
          setIsTerminateOpen(false);
          setLifecycleError(null);
        }}
        onConfirmAction={async (values) => {
          setIsLifecycleBusy(true);
          setLifecycleError(null);
          try {
            const res = await terminateUserAction({ userId: user.id, ...values });
            if (res.status === ActionStatus.SUCCESS) {
              setIsTerminateOpen(false);
              // The termination is a scheduled change: without this the header kept reading "Active"
              // with no "→ Archived from …" until a reload (walk of 2026-10-26).
              await Promise.all([refreshUser(user.id), invalidateScheduledChanges(user.id)]);
            } else {
              setLifecycleError(res.errorMessage ?? t("profile.header.terminateFailed"));
            }
          } finally {
            setIsLifecycleBusy(false);
          }
        }}
      />

      {/* Set to inactive / Set to active (U8). Inactive is an archive: a confirm, as every archive gets. */}
      <ConfirmActionModal
        isOpen={statusChange !== null}
        title={statusChange === "active"
          ? t("profile.setActive.title", { name: firstName })
          : t("profile.setInactive.title", { name: firstName })}
        description={statusChange === "active"
          ? t(setActiveDescriptionKey(user), { name: firstName })
          : t("profile.setInactive.description", { name: firstName })}
        confirmLabel={statusChange === "active" ? t("profile.header.setActive") : t("profile.header.setInactive")}
        isLoading={isLifecycleBusy}
        errorMessage={lifecycleError}
        onCancelAction={() => {
          setStatusChange(null);
          setLifecycleError(null);
        }}
        onConfirmAction={async () => {
          const to = statusChange;
          if (!to) return;
          setIsLifecycleBusy(true);
          setLifecycleError(null);
          try {
            const res = to === "active"
              ? await setActiveAction({ userId: user.id })
              : await setInactiveAction({ userId: user.id });
            if (res.status === ActionStatus.SUCCESS) {
              setStatusChange(null);
              showSuccess(to === "active"
                ? t("profile.setActive.done", { name: firstName })
                : t("profile.setInactive.done", { name: firstName }));
              await Promise.all([refreshUser(user.id), invalidateScheduledChanges(user.id)]);
            } else {
              setLifecycleError(res.errorMessage ?? null);
            }
          } finally {
            setIsLifecycleBusy(false);
          }
        }}
      />

      <ConfirmActionModal
        isOpen={isCancelInviteOpen}
        title={t("profile.cancelInvitation.title", { name: firstName })}
        description={isInvited
          ? t("profile.cancelInvitation.descriptionSent", { name: firstName })
          : t("profile.cancelInvitation.description", { name: firstName })}
        confirmLabel={t("profile.header.cancelInvitation")}
        destructive
        isLoading={isLifecycleBusy}
        errorMessage={lifecycleError}
        onCancelAction={() => {
          setIsCancelInviteOpen(false);
          setLifecycleError(null);
        }}
        onConfirmAction={async () => {
          setIsLifecycleBusy(true);
          setLifecycleError(null);
          try {
            const res = await cancelInviteAction({ userId: user.id });
            if (res.status === ActionStatus.SUCCESS) {
              setIsCancelInviteOpen(false);
              showSuccess(t("profile.cancelInvitation.done"));
              await Promise.all([refreshUser(user.id), invalidateScheduledChanges(user.id)]);
            } else {
              setLifecycleError(res.errorMessage ?? null);
            }
          } finally {
            setIsLifecycleBusy(false);
          }
        }}
      />

      <DeleteProfileModal
        isOpen={isDeleteOpen}
        userId={user.id}
        fullName={fullName}
        isBusy={isLifecycleBusy}
        error={lifecycleError}
        // Delete is offered for a draft and an inactive person only (U8): neither has an employment to end.
        onTerminateInstead={null}
        onClose={() => {
          setIsDeleteOpen(false);
          setLifecycleError(null);
        }}
        onConfirm={async () => {
          setIsLifecycleBusy(true);
          setLifecycleError(null);
          try {
            const res = await deleteUserAction({ userId: user.id });
            if (res.status === ActionStatus.SUCCESS) {
              setIsDeleteOpen(false);
              router.push("/organization/people");
            } else {
              setLifecycleError(res.errorMessage ?? t("profile.header.deleteFailed"));
            }
          } finally {
            setIsLifecycleBusy(false);
          }
        }}
      />
    </div>
  );
}

/**
 * One line under the chips saying where the person stands before they are an employee: when they
 * start, and where their invitation is. Nothing for somebody already working and registered. The start date is left
 * out while the pill beside the name says it (`startsShown`).
 */
function LifecycleNote({ user, startsShown }: { user: User; startsShown: boolean }) {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const parts: string[] = [];

  if (isProspectiveStatus(user.status) && !(startsShown && user.hireDate)) {
    parts.push(user.hireDate
      ? t("profile.lifecycleNote.starts", { date: formatDisplayDate(user.hireDate, { style: "medium" }) })
      : t("profile.lifecycleNote.noStartDate"));
  }
  if (user.inviteScheduledFor) {
    parts.push(t("profile.lifecycleNote.invitationGoesOut", { date: formatDisplayDate(user.inviteScheduledFor, { style: "medium" }) }));
  } else if (user.accountStatus === "INVITED" && user.inviteSentAt) {
    parts.push(t("profile.lifecycleNote.invited", { date: formatDisplayDate(user.inviteSentAt, { style: "medium" }) }));
  } else if (user.accountStatus === "DRAFT") {
    parts.push(t("profile.lifecycleNote.notInvited"));
  }
  if (user.accountLocked) {
    parts.push(t("profile.lifecycleNote.locked"));
  }
  if (user.pendingEmail) {
    parts.push(t("profile.lifecycleNote.pendingEmail", { email: user.pendingEmail }));
  }

  if (parts.length === 0) return null;
  // The dates are written in the reader's locale, which the server does not know: it renders "Dec 21,
  // 2026", the browser "21 Dec 2026", and React threw a hydration error over it (walk of 2026-10-26).
  return (
    <p className="mt-2 text-body text-tertiary" suppressHydrationWarning>
      {parts.join(" · ")}
    </p>
  );
}

/** A fact (QR3): a round 36 mark, 12 apart, then the label over the value. */
function HeaderFact({ label, mark, children }: { label: string; mark: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {mark}
      <div className="min-w-0">
        <p className="text-hint text-tertiary">{label}</p>
        <div className="mt-0.5 truncate text-body font-medium text-primary">{children}</div>
      </div>
    </div>
  );
}

/** A fact's mark when it is not a face: a Mist circle 36 with a 16 icon. */
function FactIcon({ icon }: { icon: React.ComponentProps<typeof Icon>["icon"] }) {
  return (
    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-pill bg-mist text-secondary">
      <Icon icon={icon} size="sm" />
    </span>
  );
}

/**
 * The one status beside the name (QR3s): Starts and Last day are status pills; Back is a pill in the policy's
 * leave colour; the next leave is quiet text with the policy's dot and opens the Time off tab. A policy the reader
 * may not see is gray, "Away".
 */
function NameStatusMark({ status, userId }: { status: NameStatus; userId: string }) {
  const t = useTranslations("organization");
  const dates = useShortDates();
  switch (status.kind) {
    case "starts":
      return <StatusBadge status="scheduled" label={t("profile.header.starts", { date: dates.date(status.date, { weekday: true }) })} />;
    case "lastDay":
      return (
        <StatusBadge
          status="pending"
          icon={Logout03Icon}
          label={t("profile.header.lastDay", { date: dates.date(status.date, { weekday: true }) })}
        />
      );
    case "back": {
      const leave = leaveClasses(status.color ?? "gray");
      return (
        <span
          title={status.policy ?? t("profile.header.away")}
          className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill pr-2.5 pl-2 text-hint font-semibold", leave.approved)}
        >
          <span aria-hidden className={cn("size-2 rounded-pill", leave.edge)} />
          {t("profile.header.back", { date: dates.date(status.date, { weekday: true }) })}
        </span>
      );
    }
    case "nextLeave": {
      const leave = leaveClasses(status.color ?? "gray");
      return (
        <Link
          href={`/organization/people/${encodeURIComponent(userId)}/time-off`}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-label text-secondary no-underline hover:underline"
        >
          <span aria-hidden className={cn("size-2 rounded-pill", leave.edge)} />
          {t("profile.header.nextLeave", {
            policy: status.policy ?? t("profile.header.away"),
            dates: dates.range(status.start, status.end),
          })}
        </Link>
      );
    }
  }
}

/** The account, always on the right (QR3s): the shared status chip, Locked and Login paused included. */
function AccountPillMark({ pill }: { pill: AccountPill }) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const label = {
    active: tCommon("status.active"),
    inactive: tCommon("status.inactive"),
    invited: tCommon("accountStatus.invited"),
    draft: tCommon("accountStatus.draft"),
    blocked: tCommon("accountStatus.blocked"),
    locked: t("profile.header.locked"),
    signInPaused: t("profile.header.signInPaused"),
  }[pill.word];
  return <StatusBadge status={pill.tone} label={label} icon={pill.word === "invited" ? Mail01Icon : undefined} />;
}

function ProfileAvatar({ url, fullName }: { url: string | null; fullName: string }) {
  return (
    <Avatar key={url ?? "avatar-fallback"} className="size-24">
      {url ? <AvatarImage src={url} alt={fullName}/> : null}
      {/* The name picks the tag colour (SPEC § 4.7) — without it every face was gray. */}
      <AvatarFallback name={fullName} className="text-greeting">{initialsOf(fullName)}</AvatarFallback>
    </Avatar>
  );
}

/**
 * Time with the company, the way the header says it: "Joined today", "4 days", "3 weeks", "7 months", "2 y 7 m",
 * "2 years". Nothing before the first day — somebody who has not started has no tenure. **Never rounded up** (the
 * designers' hub fixes Z2, 2026-11-19): somebody hired today has been here no days, not "1 week".
 */
export function tenureOf(t: OrgTranslator, hireDate: string | null | undefined, today: Date = new Date()): string | null {
  if (!hireDate) return null;
  const [y, m, d] = hireDate.slice(0, 10).split("-").map(Number);
  const start = new Date(y, m - 1, d);
  if (start > today) return null;
  let months = (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months -= 1;
  if (months < 1) {
    // Calendar days, so a change of clocks does not make a day 23 hours short of one.
    const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((todayDay - startDay) / (24 * 3600 * 1000));
    if (days === 0) return t("profile.tenure.today");
    if (days < 7) return t("profile.tenure.days", { count: days });
    return t("profile.tenure.weeks", { count: Math.floor(days / 7) });
  }
  if (months < 12) return t("profile.tenure.months", { count: months });
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return t("profile.tenure.years", { count: years });
  return t("profile.tenure.yearsMonths", { years, months: rest });
}

function initialsOf(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

function withCacheBust(url: string, version: number) {
  if (!version || url.startsWith("blob:")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${version}`;
}
