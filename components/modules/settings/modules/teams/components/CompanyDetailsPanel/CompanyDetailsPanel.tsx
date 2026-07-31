"use client";

import React from "react";
import { Building2 } from "lucide-react";

type Props = {
  name: string;
  logo: string | null;
  topLevelCount: number;
  totalCount: number;
};

export function CompanyDetailsPanel({ name, logo, topLevelCount, totalCount }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-brown-100 text-brown-600">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brown-400">Company</p>
          <h2 className="truncate text-lg font-semibold text-brown-900">{name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-brown-200 p-3.5">
          <p className="mb-1 text-xs text-brown-500">Top-level teams</p>
          <p className="text-2xl font-semibold leading-none text-brown-900">{topLevelCount}</p>
        </div>
        <div className="rounded-lg border border-brown-200 p-3.5">
          <p className="mb-1 text-xs text-brown-500">All teams</p>
          <p className="text-2xl font-semibold leading-none text-brown-900">{totalCount}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-brown-500">
        Select a team on the chart to view and edit its details. Use the expand controls on each card
        to reveal sub-teams.
      </p>
    </div>
  );
}
