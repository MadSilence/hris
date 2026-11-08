"use client";

import * as React from "react";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

export type ReadRow = {
  icon: IconSvgElement;
  /** The value, 14/500. */
  value: React.ReactNode;
  /** A grey line under it saying what it is. */
  caption?: React.ReactNode;
};

/**
 * Read mode for something live (R3, R4; PRODUCT-RULES § Controls): no disabled inputs — each value an icon row, a
 * grey 16 icon, the value 14/500 and a grey line under it saying what it is.
 */
export const ReadRows: React.FC<{ rows: ReadRow[]; className?: string }> = ({ rows, className }) => (
  <ul className={cn("flex flex-col gap-4", className)}>
    {rows.map((row, i) => (
      <li key={i} className="flex items-start gap-3">
        <Icon icon={row.icon} size="sm" className="mt-0.5 shrink-0 text-tertiary" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body font-medium text-primary [overflow-wrap:anywhere]">{row.value}</span>
          {row.caption != null && row.caption !== "" && <span className="text-label font-normal text-tertiary">{row.caption}</span>}
        </div>
      </li>
    ))}
  </ul>
);
