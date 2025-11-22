"use client";

import React from "react";
import Input from "@/components/ui/Input/Input";
import styles from "./NumberScaleRow.module.css";

type NumberScaleRowProps = {
  value: number | null;
  error?: string;
  onChange: (v: number | null) => void;
};

export const NumberScaleRow: React.FC<NumberScaleRowProps> = ({
  value,
  error,
  onChange
}) => {
  return (
    <div className={styles.row}>
      <Input
        label="Decimal scale (optional)"
        type="number"
        min={0}
        error={error}
        value={value ?? ""}
        onChange={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          onChange(v === "" ? null : Number(v));
        }}
        placeholder="e.g., 2"
      />
    </div>
  );
};
