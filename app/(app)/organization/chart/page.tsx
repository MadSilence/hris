"use client";

import React, { Suspense } from "react";

import OrgChartContainer from "@/components/modules/organization/orgChart/OrgChartContainer";
import { useAccess, useCanAccess } from "@/components/auth/useAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function OrganizationChartPage() {
  const { loading } = useAccess();
  const canViewPeople = useCanAccess("PEOPLE.PROFILE", "VIEW");

  if (loading) return null;
  if (!canViewPeople) return <AccessDenied/>;

  // The container reads `?person=`; a static route must keep useSearchParams under a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <OrgChartContainer/>
    </Suspense>
  );
}
