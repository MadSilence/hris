"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import styles from "./NumberScaleRow.module.css";

type NumberScaleRowProps = {
  value: number | null;
  error?: string;
  onChange: (v: number | null) => void;
};

export const NumberScaleRow: React.FC<NumberScaleRowProps> = ({
  value,
  error,
  onChange,
}) => {
  return (
    <div className={styles.row}>
      <label>
        Decimal scale (optional)
        <Input
          type="number"
          min={0}
          value={value ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            onChange(v === "" ? null : Number(v));
          }}
          placeholder="e.g., 2"
          aria-invalid={!!error}
        />
      </label>
      {error && <p>{error}</p>}
    </div>
  );
};
