"use client";

import React from "react";
import { OfficeComponent } from "@/components/modules/settings/modules/office/components/OfficeComponent";
import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";

const OfficeContainer: React.FC = () => {
  const { data: offices, isLoading, error } = useOffice();

  if (error) throw error;

  return (
    <OfficeComponent initialOffices={offices ?? []} isLoading={isLoading}/>
  );
};

export default OfficeContainer;
