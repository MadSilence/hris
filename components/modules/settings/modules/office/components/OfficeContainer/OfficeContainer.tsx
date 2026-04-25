"use client";

import React from "react";
import { OfficeComponent } from "@/components/modules/settings/modules/office/components/OfficeComponent";
import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";

const OfficeContainer: React.FC = () => {
  const {
    data: offices,
    isLoading: officesLoading,
    error: officesError,
  } = useOffice();

  return (
    <div className="w-full px-8">
      <div className="w-full max-h-[70vh] bg-background overflow-auto">
        <OfficeComponent initialOffices={offices ?? []} isLoading={officesLoading}/>
      </div>
    </div>
  );
};

export default OfficeContainer;
