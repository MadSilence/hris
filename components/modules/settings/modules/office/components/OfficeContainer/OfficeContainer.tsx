"use client";

import React from "react";
import { OfficeComponent } from "@/components/modules/settings/modules/office/components/OfficeComponent";
import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

const OfficeContainer: React.FC = () => {
  const { data: offices, isLoading, error } = useOffice();
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) throw error;

  return (
    <OfficeComponent initialOffices={offices ?? []} isLoading={isLoading}/>
  );
};

export default OfficeContainer;
