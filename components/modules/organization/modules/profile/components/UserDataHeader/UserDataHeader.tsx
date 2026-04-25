"use client";

import * as React from "react";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/public/desact/src/components/ui/dropdown-menu";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Pencil, Ellipsis, Share2, RefreshCw } from "lucide-react";

export type UserDataHeaderProps = {
  userId?: string;
  user?: User;
  editing?: boolean;
  onToggleEdit?: () => void;
};

export function UserDataHeader({ userId, user: userProp, editing = false, onToggleEdit }: UserDataHeaderProps) {
  const { data: userFetched } = useUserSafe(userId, !!userProp);
  const user = userProp ?? userFetched;

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

  return (
    <div className="px-8">
      <header className="py-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-6">
          <div className="relative">
            <Avatar className="size-28">
              {meta.avatarUrl ? <AvatarImage src={meta.avatarUrl} alt={fullName}/> : null}
              <AvatarFallback className="text-2xl">{initialsOf(fullName)}</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="outline" className="absolute right-1 bottom-1 rounded-full" aria-label="Edit photo">
              <Pencil className="w-4 h-4"/>
            </Button>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl leading-tight">{fullName}</h1>
            <div className="flex items-center gap-3 flex-wrap mt-3">
              {user.status && <Badge>{String(user.status).toLowerCase()}</Badge>}
              {meta.jobTitle && <Badge variant="outline">{meta.jobTitle}</Badge>}
              {(meta.department || meta.orgUnit) && <Badge variant="outline">{meta.department ?? meta.orgUnit}</Badge>}
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
            <Button variant="outline" size="icon" aria-label="Refresh">
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
                <DropdownMenuItem className="text-red-600">Delete profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator className="mt-6"/>
      </header>
    </div>
  );
}

function useUserSafe(userId?: string, skip = false) {
  try {
    return skip || !userId ? { data: undefined } : useUser(userId);
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
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
  return initials || "?";
}
