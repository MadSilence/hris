"use client";

import React, { Suspense } from "react";

import PeopleTableContainer from "@/components/modules/organization/components/PeopleTableContainer/PeopleTableContainer";
import { useAccess, useCanAccess } from "@/components/auth/useAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import PeopleTableSkeleton from "@/components/modules/organization/components/PeopleTable/PeopleTableSkeleton";

const waiting = <PeopleTableSkeleton />;

export default function OrganizationPeoplePage() {
  const { loading } = useAccess();
  const canViewPeople = useCanAccess("PEOPLE.PROFILE", "VIEW");

  if (loading) return waiting;
  if (!canViewPeople) return <AccessDenied/>;

  return (
    <Suspense fallback={waiting}>
      <PeopleTableContainer/>
    </Suspense>
  );
}
