import React from "react";

export type ColumnItem = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  group?: "system" | "other";
  icon?: React.ReactNode;
};
