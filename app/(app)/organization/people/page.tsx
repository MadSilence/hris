"use client";

import React, { Suspense } from "react";

import PeopleTableContainer from "@/components/modules/organization/components/PeopleTableContainer/PeopleTableContainer";
import { useAccess, useCanAccess } from "@/components/auth/useAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function OrganizationPeoplePage() {
  const { loading } = useAccess();
  const canViewPeople = useCanAccess("PEOPLE.PROFILE", "VIEW");

  if (loading) return null;
  if (!canViewPeople) return <AccessDenied/>;

  return (
    <Suspense fallback={null}>
      <PeopleTableContainer/>
    </Suspense>
  );
}
