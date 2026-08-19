"use client";

import { useMemo } from "react";

import type { TeamPerson } from "@/models/teams";

export type TeamMembership = {
  byTeam: Map<string, TeamPerson[]>;
  unassigned: TeamPerson[];
};

/**
 * Groups the flat people list by team. Membership is many-to-many, so a person shows up in every
 * team they belong to; people with none feed the Unassigned tab.
 */
export function useTeamMembership(people: TeamPerson[]): TeamMembership {
  return useMemo(() => {
    const byTeam = new Map<string, TeamPerson[]>();
    const unassigned: TeamPerson[] = [];

    for (const person of people) {
      if (person.teamIds.length === 0) {
        unassigned.push(person);
        continue;
      }
      for (const teamId of person.teamIds) {
        const bucket = byTeam.get(teamId);
        if (bucket) bucket.push(person);
        else byTeam.set(teamId, [person]);
      }
    }

    return { byTeam, unassigned };
  }, [people]);
}
