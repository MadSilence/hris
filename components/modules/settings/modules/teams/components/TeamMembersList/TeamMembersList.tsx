"use client";

import React, { useState } from "react";
import { useTeamMembers } from "@/components/modules/settings/modules/teams/hooks/useTeamMembers/useTeamMembers";
import { useRemoveTeamMember } from "@/components/modules/settings/modules/teams/hooks/useRemoveTeamMember/useRemoveTeamMember";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/public/desact/src/components/ui/button";
import type { TeamMember } from "@/models/teams";

const PAGE_SIZE = 20;

type Props = {
  teamId: string;
  isArchived: boolean;
};

function MemberAvatar({ member }: { member: TeamMember }) {
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();
  if (member.avatarUrl) {
    return (
      <img src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`}
        className="w-8 h-8 rounded-full object-cover flex-none" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-brown-200 flex items-center justify-center text-xs font-medium text-brown-700 flex-none">
      {initials}
    </div>
  );
}

export function TeamMembersList({ teamId, isArchived }: Props) {
  const [page, setPage] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { data, isLoading, error } = useTeamMembers(teamId, page, PAGE_SIZE);
  const removeMember = useRemoveTeamMember();

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await removeMember.mutateAsync({ id: teamId, userId });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brown-100 animate-pulse flex-none" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-brown-100 rounded animate-pulse" />
              <div className="h-3 w-24 bg-brown-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-500">Failed to load members.</p>;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (items.length === 0) return <p className="text-sm text-brown-400">No members assigned yet.</p>;

  return (
    <div className="flex flex-col gap-1">
      {items.map((member) => (
        <div key={member.userId} className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-brown-50 group">
          <MemberAvatar member={member} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brown-900 truncate">{member.firstName} {member.lastName}</p>
            <p className="text-xs text-brown-500 truncate">{member.jobTitle ?? member.email}</p>
          </div>
          <PermissionGate resource="ORG.TEAM" action="EDIT">
            {!isArchived && (
              <button
                className="opacity-0 group-hover:opacity-100 text-xs text-brown-400 hover:text-red-600 transition-opacity"
                onClick={() => handleRemove(member.userId)}
                disabled={removingId === member.userId}
                aria-label="Remove member"
              >
                {removingId === member.userId ? "…" : "Remove"}
              </button>
            )}
          </PermissionGate>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-brown-100">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <span className="text-xs text-brown-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
