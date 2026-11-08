"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { SearchField } from "@/components/ui/SearchField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import type { TeamPerson } from "@/models/teams";
import { Illustration } from "@/components/illustrations";

export type TeamSearchMode = "units" | "people";

/** One row of the people dropdown: a person *in a team*, so multi-team people appear once per team. */
export type TeamPersonHit = {
  key: string;
  person: TeamPerson;
  teamId: string | null;
};

type Props = {
  mode: TeamSearchMode;
  onModeChange: (mode: TeamSearchMode) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** Units mode: how many teams matched and which one is focused (1-based). */
  unitMatchCount: number;
  activeMatch: number;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  /** People mode: already filtered by the query. */
  peopleResults: TeamPersonHit[];
  peopleLoading: boolean;
  onPersonSelect: (hit: TeamPersonHit) => void;
  teamNameById: Map<string, string>;
  canSearchPeople: boolean;
};

function personName(person: TeamPerson): string {
  const name = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  return name || person.email;
}

function initials(person: TeamPerson): string {
  const first = (person.firstName ?? "").trim();
  const last = (person.lastName ?? "").trim();
  const fromParts = (first ? first[0] : "") + (last ? last[0] : "");
  return (fromParts || person.email.slice(0, 2)).toUpperCase();
}

export function TeamSearchBar({
  mode,
  onModeChange,
  query,
  onQueryChange,
  unitMatchCount,
  activeMatch,
  onPrevMatch,
  onNextMatch,
  peopleResults,
  peopleLoading,
  onPersonSelect,
  teamNameById,
  canSearchPeople,
}: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const isPeople = mode === "people";
  const showResults = isPeople && query.trim().length > 0;

  return (
    <div className="relative w-[420px]">
      <SearchField
        value={query}
        onChange={onQueryChange}
        placeholder={isPeople ? tShared("searchPeople") : t("search.placeholder")}
        modes={
          canSearchPeople
            ? [
                { value: "units", label: t("search.unitsMode") },
                { value: "people", label: tShared("people") },
              ]
            : undefined
        }
        mode={mode}
        onModeChange={(value) => onModeChange(value as TeamSearchMode)}
        matchCount={isPeople ? undefined : unitMatchCount}
        activeMatch={activeMatch}
        onPrev={onPrevMatch}
        onNext={onNextMatch}
      />

      {showResults && (
        <div className="absolute left-0 right-0 top-11 z-20 max-h-80 overflow-y-auto rounded-control border border-divider bg-card py-1 shadow-popover">
          {peopleLoading ? (
            <p className="px-3 py-3 text-body text-tertiary">{tShared("searching")}</p>
          ) : peopleResults.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-3 py-6 text-center">
              <Illustration scene="no-results-s" size="s" />
              <p className="text-body text-tertiary">{tShared("noPeopleMatch", { query })}</p>
            </div>
          ) : (
            peopleResults.map(({ key, person, teamId }) => {
              const teamName = teamId ? teamNameById.get(teamId) ?? t("search.unknown") : t("person.none");
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onPersonSelect({ key, person, teamId })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-subtle"
                >
                  <Avatar className="h-7 w-7 flex-none">
                    {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
                    <AvatarFallback className="text-hint">{initials(person)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-primary">
                      {personName(person)}
                    </span>
                    {person.jobName && (
                      <span className="block truncate text-hint text-tertiary">{person.jobName}</span>
                    )}
                  </span>
                  <span className="flex-none truncate text-hint text-tertiary">{teamName}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
