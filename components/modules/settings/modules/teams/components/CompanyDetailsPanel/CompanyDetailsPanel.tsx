"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Building03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

type Props = {
  name: string;
  logo: string | null;
  topLevelCount: number;
  totalCount: number;
};

export function CompanyDetailsPanel({ name, logo, topLevelCount, totalCount }: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-popover bg-mist text-secondary">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon={Building03Icon} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-hint font-medium text-tertiary">{tShared("company")}</p>
          <h2 className="truncate text-section-title text-primary">{name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-control border border-divider p-3.5">
          <p className="mb-1 text-hint text-tertiary">{t("companyPanel.topLevel")}</p>
          <p className="text-page-title leading-none text-primary">{topLevelCount}</p>
        </div>
        <div className="rounded-control border border-divider p-3.5">
          <p className="mb-1 text-hint text-tertiary">{t("companyPanel.all")}</p>
          <p className="text-page-title leading-none text-primary">{totalCount}</p>
        </div>
      </div>

      <p className="text-body leading-relaxed text-tertiary">
        {t("companyPanel.hint")}
      </p>
    </div>
  );
}
