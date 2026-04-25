"use client";

import React from "react";
import { LegalEntityComponent } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

const LegalEntityContainer: React.FC = () => {
  const {
    data: legalEntities,
    isLoading: legalEntitiesLoading,
    error: legalEntitiesError,
  } = useLegalEntity();

  return (
    <div className="w-full px-8">
      <div className="w-full max-h-[70vh] bg-background overflow-auto">
        <LegalEntityComponent initialEntities={legalEntities ?? []} isLoading={legalEntitiesLoading}/>
      </div>
    </div>
  );
};

export default LegalEntityContainer;
