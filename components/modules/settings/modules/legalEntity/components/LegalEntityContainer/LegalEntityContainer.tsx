"use client";

import React from "react";
import { LegalEntityComponent } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

const LegalEntityContainer: React.FC = () => {
  const { data: legalEntities, isLoading, error } = useLegalEntity();
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) throw error;

  return (
    <LegalEntityComponent initialEntities={legalEntities ?? []} isLoading={isLoading}/>
  );
};

export default LegalEntityContainer;
