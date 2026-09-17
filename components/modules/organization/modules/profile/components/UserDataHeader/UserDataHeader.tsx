"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { DeleteProfileModal } from "./modals/DeleteProfileModal";
import { mutate } from "swr";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  canBeInvited,
  formatUserStatus,
  isActiveStatus,
  isProspectiveStatus,
} from "@/models/user/status";
import { formatDisplayDate } from "@/lib/date";
import { useRouter } from "next/navigation";
import { Button } from "@/public/desact/src/components/ui/button";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import {
  CalendarX,
  DoorOpen,
  KeyRound,
  Lock,
  LockOpen,
  Mail,
  Pencil,
  RefreshCw,
  Rocket,
  Trash2,
  UserMinus,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCanAccess } from "@/components/auth/useAccess";
import { AccountStatusBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { ChangePasswordModal } from "@/components/modules/auth/components/ChangePasswordModal";
import {
  AccountAccessModal,
  type AccountAccessKind,
} from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/AccountAccessModal";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useStartImpersonation } from "@/components/modules/auth/impersonation/hooks/useStartImpersonation";
import {
  cancelInviteAction,
  deleteUserAction,
  terminateUserAction,
} from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";
import { InviteUserModal } from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/InviteUserModal";
import { showActionError } from "@/lib/errors/errorToast";
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

export type UserDataHeaderProps = {
  userId: string;
  user?: User;
};

export function UserDataHeader({ userId, user: userProp }: UserDataHeaderProps) {
  const { data: userFetched } = useUser(userId);
  const user = userFetched ?? userProp;

  const { userId: currentUserId, impersonating } = useCurrentUser();
  const router = useRouter();

  // Booking someone else's leave is a time-off action, not a profile one.

  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [startType, setStartType] = useState<ProcessType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isLifecycleBusy, setIsLifecycleBusy] = useState(false);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [accountAccess, setAccountAccess] = useState<AccountAccessKind | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Above the early return: hooks are counted per render.
  const canManageProfiles = useCanAccess("PEOPLE.PROFILE", "MANAGE");

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
            <div className="w-28 h-28 rounded-full bg-muted animate-pulse"/>
            <div className="space-y-3">
              <div className="h-7 w-56 bg-muted rounded-md animate-pulse"/>
              <div className="h-4 w-72 bg-muted rounded-md animate-pulse"/>
            </div>
            <div className="h-9 w-28 bg-muted rounded-md animate-pulse"/>
          </div>
        </header>
      </div>
    );
  }

  // Identity always arrives; the email may be withheld by field access, so it cannot be the last
  // resort. An unnamed person is a data problem, not a permission one.
  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "Unnamed";
  const isOwnProfile = currentUserId === user.id;
  const isTerminated = !!user.terminationDate;
  const isArchived = (user.status ?? "").toUpperCase() === "ARCHIVED";
  /**
   * A draft is a name in a table: no account, no employment, no history. The header used to offer it
   * everything an employee gets — sign in as them, terminate their employment — and every one of
   * those either refuses or means nothing. What a draft can do is Invite, Edit and Delete.
   */
  const isDraft = user.accountStatus === "DRAFT";
  // Offered while nobody has set a password yet. The profile is the one place a draft is reachable.
  const mayInvite = !isOwnProfile && !isArchived && canBeInvited(user.accountStatus);
  const isInvited = user.accountStatus === "INVITED";
  // Preboarding is for somebody with no account; onboarding for somebody who is in the system.
  const mayPreboard = !isOwnProfile && !isArchived && canBeInvited(user.accountStatus);
  const mayOnboard = !isOwnProfile && !isArchived && Boolean(user.accountStatus) && user.accountStatus !== "DRAFT";
  // BLOCK is scoped on the person, so the server's per-target answer decides — not "do I hold it
  // anywhere". Never on the own profile: blocking yourself is refused (U00010), and your own password
  // is changed, not reset.
  const mayControlAccess = !isOwnProfile && (user.capabilities?.["PEOPLE.PROFILE"] ?? []).includes("BLOCK");
  // Only somebody with a password to sign in with can be impersonated. A draft has no account at
  // all, an invitation has not been accepted, and a blocked account is refused at the door.
  const mayImpersonate = !isOwnProfile && user.accountStatus === "ACTIVE";
  // Employment is ended for somebody who has one. Never on yourself: the confirmation is the only
  // thing between a single click and locking yourself out of the company.
  const mayTerminate = canManageProfiles && !isOwnProfile && !isDraft;
  const mayBlock = mayControlAccess && (user.accountStatus === "ACTIVE" || user.accountStatus === "INVITED");
  const mayUnblock = mayControlAccess && user.accountStatus === "BLOCKED";
  const maySendReset = mayControlAccess && user.accountStatus === "ACTIVE";
  const isLocked = Boolean(user.accountLocked);
  const hasPersonActions =
    mayTerminate || mayBlock || mayUnblock || maySendReset ||
    (canManageProfiles && (Boolean(user.inviteScheduledFor) || mayPreboard || mayOnboard || !isOwnProfile));

  const rawAvatarUrl =
    avatarOverrideUrl !== undefined ? avatarOverrideUrl : user.avatarUrl ?? null;

  const avatarUrl = rawAvatarUrl ? withCacheBust(rawAvatarUrl, avatarVersion) : null;

  return (
    <div>
      <header className="pb-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-6">
          <div className="relative">
            <Avatar key={avatarUrl ?? "avatar-fallback"} className="size-28">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName}/> : null}
              <AvatarFallback className="text-2xl">
                {initialsOf(fullName)}
              </AvatarFallback>
            </Avatar>

            {/* Own photo is always editable; someone else's needs profile EDIT. */}
            <PermissionGate
              resource={isOwnProfile ? undefined : "PEOPLE.PROFILE"}
              action="EDIT"
            >
              <Button
                size="icon"
                variant="outline"
                className="absolute right-1 bottom-1 rounded-full"
                aria-label="Edit photo"
                disabled={isAvatarLoading}
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <Pencil className="w-4 h-4"/>
              </Button>
            </PermissionGate>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight text-foreground">{fullName}</h1>

            {user.email && (
              <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap mt-3">
              {user.status && (
                <Badge
                  variant="outline"
                  className={
                    isActiveStatus(user.status)
                      ? "border-green-200 bg-green-50 text-green-700"
                      : ""
                  }
                >
                  {formatUserStatus(user.status)}
                </Badge>
              )}

              {/* Registered and able to sign in is the unremarkable case, and gets no chip. */}
              <AccountStatusBadge accountStatus={user.accountStatus}/>

              {isLocked && <StatusBadge status="inactive" label="Locked"/>}

              {user.jobName && <Badge variant="outline">{user.jobName}</Badge>}

              {user.department?.name && (
                <Badge variant="outline">{user.department.name}</Badge>
              )}

              {user.office?.name && <Badge variant="outline">{user.office.name}</Badge>}
            </div>

            <LifecycleNote user={user} />
          </div>

          {/*
            Only actions with something behind them. Share and "Set a reminder" were removed with
            the other stubs and deliberately not brought back — there is no feature under them.
          */}
          <div className="flex items-center gap-2">
            {/*
              There is no user menu in the app shell — the sidebar's avatar is a link to this page — so
              the own profile is where a person changes their own password.
            */}
            {/*
              Your own password, on your own profile — and not while impersonating. The screen says
              "own profile" because the session is that person, but the human at the keyboard is
              somebody else, and the dialog would ask for a password they do not have and must not set.
            */}
            {isOwnProfile && !impersonating && (
              <Button variant="outline" className="gap-1.5" onClick={() => setIsChangePasswordOpen(true)}>
                <KeyRound className="h-4 w-4"/>
                Change Password
              </Button>
            )}

            {mayImpersonate && (
              <PermissionGate resource="SETTINGS.IMPERSONATION" action="MANAGE">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Login as user"
                  title="Login as user"
                  disabled={startImpersonation.isPending}
                  onClick={() => startImpersonation.mutate({ targetUserId: user.id })}
                >
                  <RefreshCw className="w-4 h-4"/>
                </Button>
              </PermissionGate>
            )}

            {mayInvite && (
              <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
                <Button
                  variant={isInvited ? "outline" : "default"}
                  className="gap-1.5"
                  onClick={() => setIsInviteOpen(true)}
                >
                  <Mail className="h-4 w-4"/>
                  {isInvited ? "Resend Invitation" : "Invite"}
                </Button>
              </PermissionGate>
            )}

            {/*
              Two rights meet in this menu: MANAGE for the record, BLOCK for sign-in. Somebody holding
              only BLOCK — a security officer, say — still gets the menu, with only its access items.
            */}
            {hasPersonActions && (
              <RowActionsMenu label="Person Actions">
                {canManageProfiles && user.inviteScheduledFor && (
                  <RowAction
                    icon={<CalendarX className="h-4 w-4"/>}
                    onClick={async () => {
                      const res = await cancelInviteAction({ userId: user.id });
                      if (res.status === ActionStatus.SUCCESS) await refreshUser(user.id);
                      else showActionError(res);
                    }}
                  >
                    Cancel Scheduled Invitation
                  </RowAction>
                )}
                {canManageProfiles && mayPreboard && (
                  <RowAction icon={<DoorOpen className="h-4 w-4"/>} onClick={() => setStartType("PREBOARDING")}>
                    Start Preboarding
                  </RowAction>
                )}
                {canManageProfiles && mayOnboard && (
                  <RowAction icon={<Rocket className="h-4 w-4"/>} onClick={() => setStartType("ONBOARDING")}>
                    Start Onboarding
                  </RowAction>
                )}
                {maySendReset && (
                  <RowAction icon={<KeyRound className="h-4 w-4"/>} onClick={() => setAccountAccess("RESET")}>
                    {isLocked ? "Send Password Reset to Unlock" : "Send Password Reset"}
                  </RowAction>
                )}
                {mayBlock && (
                  <RowAction icon={<Lock className="h-4 w-4"/>} onClick={() => setAccountAccess("BLOCK")}>
                    Block Account
                  </RowAction>
                )}
                {mayUnblock && (
                  <RowAction icon={<LockOpen className="h-4 w-4"/>} onClick={() => setAccountAccess("UNBLOCK")}>
                    Unblock Account
                  </RowAction>
                )}
                {mayTerminate && (
                  <RowAction
                    icon={<UserMinus className="h-4 w-4"/>}
                    onClick={() => setIsTerminateOpen(true)}
                    disabled={isTerminated}
                  >
                    {isTerminated ? "Already Terminated" : "Terminate Employment"}
                  </RowAction>
                )}
                {canManageProfiles && !isOwnProfile && (
                  <RowActionDestructive
                    icon={<Trash2 className="h-4 w-4"/>}
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete Profile
                  </RowActionDestructive>
                )}
              </RowActionsMenu>
            )}
          </div>
        </div>

        <Separator className="mt-6"/>
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

      <AccountAccessModal
        kind={accountAccess}
        userId={user.id}
        fullName={fullName}
        accountLocked={isLocked}
        onCloseAction={() => setAccountAccess(null)}
        onChangedAction={() => refreshUser(user.id)}
      />

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
        onInvitedAction={async () => {
          await refreshUser(user.id);
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
              await refreshUser(user.id);
            } else {
              setLifecycleError(res.errorMessage ?? "Failed to terminate employment.");
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
        onTerminateInstead={isTerminated ? null : () => {
          setIsDeleteOpen(false);
          setLifecycleError(null);
          setIsTerminateOpen(true);
        }}
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
              setLifecycleError(res.errorMessage ?? "Failed to delete the profile.");
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
 * start, and where their invitation is. Nothing for somebody already working and registered.
 */
function LifecycleNote({ user }: { user: User }) {
  const parts: string[] = [];

  if (isProspectiveStatus(user.status)) {
    parts.push(user.hireDate
      ? `Starts ${formatDisplayDate(user.hireDate, { style: "medium" })}`
      : "No start date yet");
  }
  if (user.inviteScheduledFor) {
    parts.push(`Invitation goes out ${formatDisplayDate(user.inviteScheduledFor, { style: "medium" })}`);
  } else if (user.accountStatus === "INVITED" && user.inviteSentAt) {
    parts.push(`Invited ${formatDisplayDate(user.inviteSentAt, { style: "medium" })}, not registered yet`);
  } else if (user.accountStatus === "DRAFT") {
    parts.push("Not invited");
  }
  if (user.accountLocked) {
    parts.push("Locked after too many failed sign-ins — send a password reset to unlock");
  }

  if (parts.length === 0) return null;
  return <p className="mt-2 text-sm text-muted-foreground">{parts.join(" · ")}</p>;
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
