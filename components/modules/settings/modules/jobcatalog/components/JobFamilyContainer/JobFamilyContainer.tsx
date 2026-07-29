"use client";

import React from "react";
import { useJobFamily } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import {
  JobFamilyComponent
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/JobFamily/JobFamilyComponent";
import { Loader } from "@/components/ui/Loader";

export default function JobFamilyContainer() {
  const { data, isLoading, error } = useJobFamily();

  if (error) {
    return (
      <div className="py-10 text-sm text-muted-foreground">
        Failed to load job families
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader/>
      </div>
    );
  }

  return <JobFamilyComponent jobFamilies={data ?? []}/>;
}
