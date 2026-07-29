"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";

export interface UserChipProps {
  id?: string | null;
  name: string;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
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
}: UserChipProps) {
  const initials = getInitials({ name, firstName, lastName, email });

  const inner = (
    <>
      <Avatar className="h-6 w-6 shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name}/> : null}
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </>
  );

  const base = "inline-flex max-w-full items-center gap-2 rounded-md -mx-1.5 px-1.5 py-1";

  if (!id) {
    return <span className={base}>{inner}</span>;
  }

  return (
    <Link
      href={`/organization/people/${id}/personal`}
      className={`${base} no-underline transition-colors hover:bg-white hover:shadow-sm`}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}
