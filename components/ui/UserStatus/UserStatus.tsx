"use client";

import React from "react";
import styles from "./UserStatus.module.css";

type UserStatusProps = { status?: string };

const UserStatus: React.FC<UserStatusProps> = ({ status }) => {
  const val = (status ?? "").toLowerCase();

  let cls = styles.badge;
  if (val === "active") cls += " " + styles.active;
  else if (val === "inactive") cls += " " + styles.inactive;
  else if (val === "suspended") cls += " " + styles.suspended;
  else if (val === "pending") cls += " " + styles.pending;

  const label = status ?? "—";
  return <span className={cls}>{label}</span>;
};

export default UserStatus;
