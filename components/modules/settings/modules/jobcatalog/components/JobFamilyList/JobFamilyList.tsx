"use client";

import React from "react";
import styles from "./JobFamilyList.module.css";
import { Button } from "@/components/ui/Button";

export type JobLevel = {
  id: string;
  name: string;
  isSystem?: boolean;
};

export type Job = {
  id: string;
  name: string;
  isSystem?: boolean;
  level: JobLevel;
};

export type JobFamily = {
  id: string;
  name: string;
  isSystem?: boolean;
  jobs: Job[];
};

export interface JobFamilyListProps {
  jobFamilies: JobFamily[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const JobFamilyList: React.FC<JobFamilyListProps> = ({
  jobFamilies,
  selectedId,
  onSelect,
  onCreate,
}) => {
  return (
    <div className={styles.root}>
      <div className={styles.create}>
        <Button style={{ width: "100%" }} onClick={onCreate}>
          Create a job family
        </Button>
      </div>

      <div className={styles.list}>
        {jobFamilies.map((jobFamily) => (
          <button
            key={jobFamily.id}
            type="button"
            className={`${styles.item} ${
              jobFamily.id === selectedId ? styles.active : ""
            }`}
            onClick={() => onSelect(jobFamily.id)}
          >
            <span className={styles.name}>{jobFamily.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
