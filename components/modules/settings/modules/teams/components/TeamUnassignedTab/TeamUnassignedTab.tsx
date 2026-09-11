"use client";

import React, { useMemo, useState } from "react";
import { UserRoundX } from "lucide-react";

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
          <div key={i} className="h-9 animate-pulse rounded-lg bg-brown-100" />
        ))}
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-100 text-brown-500">
          <UserRoundX className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-brown-900">Everyone is on a team</p>
          <p className="mt-1 text-sm text-brown-400">
            People without one would show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-6">
      <div className="flex-none">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
          Unassigned people
        </h3>
        <p className="mb-3 text-sm text-brown-500">
          {people.length} {people.length === 1 ? "person is" : "people are"} not on any team.
        </p>
        <SearchBox value={query} onChange={setQuery}/>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <NoResults hint="Try a different name or email."/>
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
