"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { formatUserStatus, isActiveStatus } from "@/models/user/status";
import { Button } from "@/public/desact/src/components/ui/button";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Pencil, RefreshCw } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCurrentUser } from "@/components/hooks/useCurrentUser/useCurrentUser";
import { useStartImpersonation } from "@/components/modules/auth/impersonation/hooks/useStartImpersonation";
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

  const { data: currentUser } = useCurrentUser();

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

  const refreshUser = async (targetUserId: string) => {
    return mutate<User>(`/api/users/${targetUserId}`);
  };

  const handleAvatarConfirm = async (submission: UpdateUserAvatarSubmission) => {
    if (!user?.id) return;

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

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  const isOwnProfile = currentUser?.id === user.id;

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

              {user.jobName && <Badge variant="outline">{user.jobName}</Badge>}

              {user.department?.name && (
                <Badge variant="outline">{user.department.name}</Badge>
              )}

              {user.office?.name && <Badge variant="outline">{user.office.name}</Badge>}
            </div>
          </div>

          {/*
            Impersonation is the only header action that is actually wired. The rest of what used to
            live here (Share, Manage account, Set a reminder, Schedule leave, Terminate employment,
            Delete profile) had no handlers at all — they come back one by one as their features land.
          */}
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
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
          </div>
        </div>

        <Separator className="mt-6"/>
      </header>

      <UpdateUserAvatarModal
        isOpen={isAvatarModalOpen}
        isLoading={isAvatarLoading}
        fullName={fullName}
        avatarUrl={avatarUrl}
        onConfirmAction={handleAvatarConfirm}
        onRequestCloseAction={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
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
