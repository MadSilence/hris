"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CompanyCalendarAbsence, CompanyCalendarUser } from "@/models/calendar";
import type { BoardScale } from "@/components/modules/calendar/lib/boardGeometry";

/** Where the board's days are: the first loaded day, how many, how wide, and which day is today. */
export type BoardGeometry = {
  rangeStart: Date;
  dayCount: number;
  dayW: number;
  scale: BoardScale;
  isNonWorkingDay: (d: Date) => boolean;
  /** Today's column, or -1 when it is not loaded. */
  todayIndex: number;
  /** Days that are a holiday for every row shown (N25): drawn across the whole column, header included. */
  columnHolidays: ReadonlyMap<number, string>;
  /** The months row and the day row together — where the group bands stick. */
  headerHeight: number;
};

/** What the leave card can do, decided by the board's container: who may decide a request, and how. */
export type LeaveDecisions = {
  canDecide: (a: CompanyCalendarAbsence) => boolean;
  approve: (a: CompanyCalendarAbsence) => void;
  /** `name`: the person's, for the Decline window's words. */
  decline: (a: CompanyCalendarAbsence, name?: string) => void;
  /** ↗ — the request in full, or nothing when the reader may not open it. */
  openFull: (a: CompanyCalendarAbsence) => ReactNode;
};

/**
 * Every row the board has loaded and its leave, flat or in groups — read by the leave card for "who else is away"
 * (N05). A plain store, not state: it is read when a card opens, and a card is opened by a click long after the rows
 * that filled it.
 */
export class BoardRegistry {
  private readonly parts = new Map<string, { users: CompanyCalendarUser[]; absences: CompanyCalendarAbsence[] }>();

  set(key: string, users: CompanyCalendarUser[], absences: CompanyCalendarAbsence[]): void {
    this.parts.set(key, { users, absences });
  }

  delete(key: string): void {
    this.parts.delete(key);
  }

  absences(): CompanyCalendarAbsence[] {
    return [...this.parts.values()].flatMap((p) => p.absences);
  }

  nameOf(userId: string): string | undefined {
    for (const part of this.parts.values()) {
      const user = part.users.find((u) => u.id === userId);
      if (user) return displayName(user);
    }
    return undefined;
  }
}

export const displayName = (u: Pick<CompanyCalendarUser, "firstName" | "lastName" | "email">): string =>
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

export type BoardContextValue = {
  geometry: BoardGeometry;
  registry: BoardRegistry;
  decisions: LeaveDecisions;
  /** The days a row is picking (columns), for the header to mark (the designers' answer 1.5). */
  picked: { from: number; to: number } | null;
  setPicked: (picked: { from: number; to: number } | null) => void;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export const useBoard = (): BoardContextValue => {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard outside a CompanyCalendarBoard");
  return value;
};
