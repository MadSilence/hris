"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { UserBlock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { PersonChip } from "@/components/ui/PersonChip";
import {
  personDisplayName,
  personInitials,
} from "@/components/modules/settings/modules/teams/utils/personDisplay";
import type { TeamPerson } from "@/models/teams";
import { SearchBox } from "@/components/ui/SearchBox";
import { NoResults } from "@/components/feedback/EmptyState";

type Props = {
  people: TeamPerson[];
  isLoading: boolean;
  selectedPersonId: string | null;
  onSelectPerson: (person: TeamPerson) => void;
  /** Phase 5 turns these chips into drag sources and the panel into a drop target. */
  renderPersonChip?: (person: TeamPerson) => React.ReactNode;
};

/**
 * People with no team at all. Doubles as the drop target for taking someone out of the
 * structure, and as a standing report of who was never placed.
 */
export function TeamUnassignedTab({
  people,
  isLoading,
  selectedPersonId,
  onSelectPerson,
  renderPersonChip,
}: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return people;
    return people.filter((person) =>
      `${personDisplayName(person)} ${person.email}`.toLowerCase().includes(term),
    );
  }, [people, query]);

  if (isLoading) {
    return (
      <div className="space-y-1.5 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 shimmer rounded-control bg-mist" />
        ))}
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-mist text-tertiary">
          <Icon icon={UserBlock01Icon} />
        </div>
        <div>
          <p className="text-body font-medium text-primary">{t("unassigned.allPlaced")}</p>
          <p className="mt-1 text-body text-tertiary">{t("unassigned.allPlacedHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-6">
      <div className="flex-none">
        <h3 className="mb-1 text-hint font-semibold text-tertiary">{tShared("unassignedPeople")}</h3>
        <p className="mb-3 text-body text-tertiary">
          {t("unassigned.count", { count: people.length })}
        </p>
        <SearchBox value={query} onChange={setQuery}/>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <NoResults hint={tShared("tryDifferent")}/>
        ) : (
          filtered.map((person) =>
            renderPersonChip ? (
              <React.Fragment key={person.id}>{renderPersonChip(person)}</React.Fragment>
            ) : (
              <PersonChip
                key={person.id}
                name={personDisplayName(person)}
                jobName={person.jobName}
                avatarUrl={person.avatarUrl}
                initials={personInitials(person)}
                selected={selectedPersonId === person.id}
                archived={person.status !== "ACTIVE"}
                onClick={() => onSelectPerson(person)}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}
