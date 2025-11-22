"use client";

import * as React from "react";
import styles from "./UserDataHeader.module.css";
import type { User } from "@/models/user/User";
import { useUser } from "@/components/hooks/useUser/useUser";
import Pen from "@/public/icons/pen.svg";

export type UserDataHeaderProps = {
  userId?: string;
  user?: User;
  editing?: boolean;
  onToggleEdit?: () => void;
};

export function UserDataHeader({ userId, user: userProp, editing = false, onToggleEdit }: UserDataHeaderProps) {
  const { data: userFetched } = useUserSafe(userId, !!userProp);
  const user = userProp ?? userFetched;
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <header className={styles.header}>
        <div className={styles.row}>
          <div className={styles.avatarSkeleton} />
          <div className={styles.titles}>
            <div className={styles.nameSkeleton} />
            <div className={styles.metaSkeleton} />
          </div>
          <div className={styles.actions} />
        </div>
      </header>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  const meta = normalizeCustom(user.custom);

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <div className={styles.avatarWrap}>
          <Avatar src={meta.avatarUrl} name={fullName} color={user.avatarColor} />
          <button type="button" className={styles.avatarEditBtn} aria-label="Edit photo">
            <Pen />
          </button>
        </div>

        <div className={styles.titles}>
          <h1 className={styles.name}>{fullName}</h1>
          <div className={styles.metaLine}>
            {user.status && <span className={styles.chip}>{user.status.toLowerCase()}</span>}
          </div>
          <div className={styles.badges}>
            {meta.jobTitle && <span className={styles.badge}>{meta.jobTitle}</span>}
            {(meta.department || meta.orgUnit) && (
              <span className={styles.badge}>{meta.department ?? meta.orgUnit}</span>
            )}
            {meta.workMode && <span className={styles.badge}>{meta.workMode}</span>}
            {(meta.country || meta.location) && (
              <span className={styles.badge}>
                {meta.location ? `${meta.location}` : null}
                {meta.location && meta.country ? " · " : ""}
                {meta.country ?? ""}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Org chart" />
          <button type="button" className={styles.iconBtn} aria-label="Activity" />
          <div className={styles.menuWrap}>
            <button
              type="button"
              className={styles.kebab}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
            />
            {open && (
              <div role="menu" className={styles.menu} onMouseLeave={() => setOpen(false)}>
                <button role="menuitem" className={styles.menuItem} onClick={onToggleEdit}>
                  {editing ? "Exit edit mode" : "Edit profile"}
                </button>
                <button role="menuitem" className={styles.menuItem}>Manage account</button>
                <button role="menuitem" className={styles.menuItem}>Set a reminder</button>
                <button role="menuitem" className={styles.menuItem}>Schedule leave</button>
                <button role="menuitem" className={styles.menuItem}>Terminate employment</button>
                <div className={styles.menuDivider} />
                <button role="menuitem" className={`${styles.menuItem} ${styles.danger}`}>Delete profile</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
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

function Avatar({ src, name, color }: { src?: string | null; name: string; color: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className={styles.avatar} style={{ background: color }} >
      {src ? <img src={src} alt={name} /> : <span>{initials || "?"}</span>}
    </div>
  );
}
