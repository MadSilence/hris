"use client";

import React from "react";
import styles from "./JobLevelContainer.module.css";
import { JobLevel } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevel/JobLevel";
import { JobLevelGroup } from "@/models/job";

const MOCK_JOB_LEVEL_GROUPS: JobLevelGroup[] = [
  {
    id: "ic",
    name: "Individual Contributor",
    isSystem: true,
    levels: [
      { id: "ic-junior", name: "Junior", sortOrder: 1, isSystem: true },
      { id: "ic-middle", name: "Middle", sortOrder: 2, isSystem: true },
      { id: "ic-senior", name: "Senior", sortOrder: 3, isSystem: true },
      { id: "ic-principal", name: "Principal", sortOrder: 4, isSystem: true },
      { id: "ic-junior-2", name: "Junior", sortOrder: 5, isSystem: false },
      { id: "ic-middle-2", name: "Middle", sortOrder: 6, isSystem: false },
      { id: "ic-senior-2", name: "Senior", sortOrder: 7, isSystem: false },
      { id: "ic-principal-2", name: "Principal", sortOrder: 8, isSystem: false },
    ],
  },
  {
    id: "management",
    name: "Management",
    isSystem: true,
    levels: [
      { id: "mgmt-lead", name: "Lead", sortOrder: 1, isSystem: true },
      { id: "mgmt-manager", name: "Manager", sortOrder: 2, isSystem: true },
      {
        id: "mgmt-sr-manager",
        name: "Senior Manager",
        sortOrder: 3,
        isSystem: true,
      },
      { id: "mgmt-director", name: "Director", sortOrder: 4, isSystem: true },
    ],
  },
  {
    id: "exec",
    name: "Executive",
    isSystem: true,
    levels: [
      { id: "exec-vp", name: "VP", sortOrder: 1, isSystem: true },
      { id: "exec-svp", name: "SVP", sortOrder: 2, isSystem: true },
      { id: "exec-c-level", name: "C-Level", sortOrder: 3, isSystem: true },
    ],
  },
  {
    id: "interns",
    name: "Intern / Trainee",
    isSystem: false,
    levels: [
      { id: "intern", name: "Intern", sortOrder: 1, isSystem: false },
    ],
  },
];

export default function JobLevelContainer() {
  const jobLevelGroups = MOCK_JOB_LEVEL_GROUPS;

  return (
    <div className={styles.container}>
      <JobLevel initialGroups={jobLevelGroups}/>
    </div>
  );
}
