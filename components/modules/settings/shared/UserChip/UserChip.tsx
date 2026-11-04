"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { cn } from "@/lib/cn";

export interface UserChipProps {
  id?: string | null;
  name: string;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  className?: string;
}

function getInitials(props: {
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const a = (props.firstName ?? "").trim();
  const b = (props.lastName ?? "").trim();
  const fromParts = (a ? a[0] : "") + (b ? b[0] : "");
  if (fromParts) return fromParts.toUpperCase();

  const source = (props.name || props.email || "").trim();
  const words = source.split(/\s+/).filter(Boolean);
  const fromName = words.length >= 2 ? words[0][0] + words[1][0] : source.slice(0, 2);
  return (fromName || "—").toUpperCase();
}

export default function UserChip({
  id,
  name,
  avatarUrl,
  firstName,
  lastName,
  email,
  className,
}: UserChipProps) {
  const initials = getInitials({ name, firstName, lastName, email });

  const inner = (
    <>
      <Avatar className="h-6 w-6 shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name}/> : null}
        <AvatarFallback className="text-hint">{initials}</AvatarFallback>
      </Avatar>
      <span className="truncate text-body font-medium text-primary">{name}</span>
    </>
  );

  const base = "inline-flex max-w-full items-center gap-2 rounded-control -mx-1.5 px-1.5 py-1";

  if (!id) {
    return <span className={cn(base, className)}>{inner}</span>;
  }

  return (
    <Link
      href={`/organization/people/${id}/personal`}
      className={cn(base, "no-underline transition-colors hover:bg-card hover:shadow-card", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}
