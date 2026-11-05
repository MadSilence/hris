"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";

type Props = {
  impact?: DetachedPeopleImpact;
  isLoading?: boolean;
  isError?: boolean;
  /** What they lose — each kind has its own sentences in the catalogue. */
  kind: DetachedPeopleKind;
};

export type DetachedPeopleKind = "office" | "legalEntity";

const fullName = (p: DetachedPeopleImpact["people"][number], unnamed: string) =>
  `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || unnamed;

/**
 * Who loses the office or legal entity being deleted, by name — decided 2026-09-14: deleting detaches
 * its people, and says who first. Loading, failed and empty are three different sentences, because the
 * one thing the reader is settling before pressing Delete is exactly this.
 */
export const DetachedPeopleNotice: React.FC<Props> = ({ impact, isLoading, isError, kind }) => {
  const t = useTranslations("settings");
  const k = kind;
  if (isLoading) {
    return <p className="m-0 text-body text-tertiary">{t(`shared.detachedPeople.${k}.checking`)}</p>;
  }
  if (isError || !impact) {
    return (
      <p className="m-0 text-body text-tertiary">
        {t(`shared.detachedPeople.${k}.unchecked`)}
      </p>
    );
  }
  if (impact.peopleCount === 0) {
    return <p className="m-0 text-body text-tertiary">{t(`shared.detachedPeople.${k}.nobody`)}</p>;
  }

  const rest = impact.peopleCount - impact.people.length;
  return (
    <div className="space-y-1 text-body">
      <p className="m-0">
        {t(`shared.detachedPeople.${k}.loses`, { count: impact.peopleCount })}
      </p>
      <p className="m-0 text-tertiary">
        {(() => {
          const names = impact.people.map((p) => fullName(p, t("shared.detachedPeople.unnamed"))).join(", ");
          return rest > 0
            ? t("shared.detachedPeople.namesMore", { names, count: rest })
            : t("shared.detachedPeople.names", { names });
        })()}
      </p>
    </div>
  );
};
