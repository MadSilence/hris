"use client";

import { useMemo } from "react";

import type { DepartmentPerson } from "@/models/departments";

export type DepartmentMembership = {
  byDepartment: Map<string, DepartmentPerson[]>;
  unassigned: DepartmentPerson[];
};

/** Groups the flat people list by department; people without one feed the Unassigned tab. */
export function useDepartmentMembership(people: DepartmentPerson[]): DepartmentMembership {
  return useMemo(() => {
    const byDepartment = new Map<string, DepartmentPerson[]>();
    const unassigned: DepartmentPerson[] = [];

    for (const person of people) {
      if (!person.departmentId) {
        unassigned.push(person);
        continue;
      }
      const bucket = byDepartment.get(person.departmentId);
      if (bucket) bucket.push(person);
      else byDepartment.set(person.departmentId, [person]);
    }

    return { byDepartment, unassigned };
  }, [people]);
}
