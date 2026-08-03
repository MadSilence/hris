"use client";

import React from "react";

import OrgChartContainer from "@/components/modules/organization/orgChart/OrgChartContainer";
import { useAccess, useCanAccess } from "@/components/auth/useAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function OrganizationChartPage() {
  const { loading } = useAccess();
  const canViewPeople = useCanAccess("PEOPLE.PROFILE", "VIEW");

  if (loading) return null;
  if (!canViewPeople) return <AccessDenied/>;

  return <OrgChartContainer/>;
}
