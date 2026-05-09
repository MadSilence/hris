"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Ellipsis, Pencil, RefreshCw, Share2 } from "lucide-react";
import { useStartImpersonation } from "@/components/modules/auth/impersonation/hooks/useStartImpersonation";
import {
  UpdateUserAvatarModal,
  UpdateUserAvatarSubmission,
} from "@/components/modules/organization/modules/profile/components/UserDataHeader/modals/UpdateUserAvatarModal";
import { useUploadUserAvatar } from "@/components/modules/organization/modules/profile/hooks/useUploadUserAvatar";
import { useDeleteUserAvatar } from "@/components/modules/organization/modules/profile/hooks/useDeleteUserAvatar";

export type UserDataHeaderProps = {
  userId?: string;
  user?: User;
  editing?: boolean;
  onToggleEdit?: () => void;
};

export function UserDataHeader({
  userId,
  user: userProp,
  editing = false,
  onToggleEdit,
}: UserDataHeaderProps) {
  const resolvedUserId = userId ?? userProp?.id;
  const { data: userFetched } = useUserSafe(resolvedUserId);
  const user = userFetched ?? userProp;

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
  const meta = normalizeCustom(user.custom);

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
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl leading-tight">{fullName}</h1>

            <div className="flex items-center gap-3 flex-wrap mt-3">
              {user.status && <Badge>{String(user.status).toLowerCase()}</Badge>}
              {meta.jobTitle && <Badge variant="outline">{meta.jobTitle}</Badge>}

              {(meta.department || meta.orgUnit) && (
                <Badge variant="outline">{meta.department ?? meta.orgUnit}</Badge>
              )}

              {meta.workMode && <Badge variant="outline">{meta.workMode}</Badge>}

              {(meta.country || meta.location) && (
                <Badge variant="outline">
                  {meta.location ? `${meta.location}` : null}
                  {meta.location && meta.country ? " · " : ""}
                  {meta.country ?? ""}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Login as user"
              disabled={!user.id || startImpersonation.isPending}
              onClick={() => startImpersonation.mutate({ targetUserId: user.id })}
            >
              <RefreshCw className="w-4 h-4"/>
            </Button>

            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 className="w-4 h-4"/>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <Ellipsis className="w-4 h-4"/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onToggleEdit}>
                  {editing ? "Exit edit mode" : "Edit profile"}
                </DropdownMenuItem>
                <DropdownMenuItem>Manage account</DropdownMenuItem>
                <DropdownMenuItem>Set a reminder</DropdownMenuItem>
                <DropdownMenuItem>Schedule leave</DropdownMenuItem>
                <DropdownMenuItem>Terminate employment</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="text-red-600">
                  Delete profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

function useUserSafe(userId?: string) {
  try {
    return userId ? useUser(userId) : { data: undefined };
  } catch {
    return { data: undefined as User | undefined };
  }
}

type CustomMeta = {
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  orgUnit?: string | null;
  location?: string | null;
  country?: string | null;
  workMode?: string | null;
};

function normalizeCustom(custom: any): CustomMeta {
  const c = (custom ?? {}) as CustomMeta;

  return {
    avatarUrl: c.avatarUrl ?? null,
    jobTitle: c.jobTitle ?? null,
    department: c.department ?? null,
    orgUnit: c.orgUnit ?? null,
    location: c.location ?? null,
    country: c.country ?? null,
    workMode: c.workMode ?? null,
  };
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
