"use client";

import * as React from "react";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";

type Props = {
  impact?: DetachedPeopleImpact;
  isLoading?: boolean;
  isError?: boolean;
  /** "office" or "legal entity" — the sentence names what they lose. */
  noun: string;
};

const fullName = (p: DetachedPeopleImpact["people"][number]) =>
  `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Unnamed person";

/**
 * Who loses the office or legal entity being deleted, by name — decided 2026-09-14: deleting detaches
 * its people, and says who first. Loading, failed and empty are three different sentences, because the
 * one thing the reader is settling before pressing Delete is exactly this.
 */
export const DetachedPeopleNotice: React.FC<Props> = ({ impact, isLoading, isError, noun }) => {
  if (isLoading) {
    return <p className="m-0 text-sm text-muted-foreground">Checking who is assigned to this {noun}…</p>;
  }
  if (isError || !impact) {
    return (
      <p className="m-0 text-sm text-muted-foreground">
        Who is assigned to this {noun} could not be checked. Anyone assigned to it will lose it.
      </p>
    );
  }
  if (impact.peopleCount === 0) {
    return <p className="m-0 text-sm text-muted-foreground">Nobody is assigned to this {noun}.</p>;
  }

  const rest = impact.peopleCount - impact.people.length;
  return (
    <div className="space-y-1 text-sm">
      <p className="m-0">
        {impact.peopleCount} {impact.peopleCount === 1 ? "person loses" : "people lose"} this {noun} and
        will have none until somebody assigns another:
      </p>
      <p className="m-0 text-muted-foreground">
        {impact.people.map(fullName).join(", ")}
        {rest > 0 ? ` and ${rest} more` : ""}.
      </p>
    </div>
  );
};
