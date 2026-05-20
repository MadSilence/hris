"use client";

import React from "react";
import { LegalEntityComponent } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

const LegalEntityContainer: React.FC = () => {
  const { data: legalEntities, isLoading, error } = useLegalEntity();

  if (error) throw error;

  return (
    <LegalEntityComponent initialEntities={legalEntities ?? []} isLoading={isLoading}/>
  );
};

export default LegalEntityContainer;
