"use client";

import React from "react";
import styles from "./JobFamilyContainer.module.css";
import { useJobFamily } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import {
  JobFamilyComponent
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/JobFamily/JobFamilyComponent";
import { Loader } from "@/components/ui/Loader";

export type JobFamilyEntity = {
  id: string;
  name: string;
  isSystem?: boolean;
};

export default function JobFamilyContainer() {
  const {
    data: fetchedJobFamilies,
    isLoading: isLoading,
    error: error,
  } = useJobFamily();

  if (error) {
    return (
      <div className={styles.layout}>
        <div className={styles.loaderWrapper}>Failed to load job families</div>
      </div>
    );
  }

  const jobFamilies = fetchedJobFamilies ?? [];

  return (
    (isLoading ?
        <div className={styles.loaderWrapper}>
          <Loader/>
        </div>
        :
        <div className={styles.outer}>
          <div className={styles.container}>
            <JobFamilyComponent
              jobFamilies={jobFamilies}

            />
          </div>
        </div>
    )
  );
}
