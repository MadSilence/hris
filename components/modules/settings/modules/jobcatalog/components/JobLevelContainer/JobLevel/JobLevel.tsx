"use client";

import React from "react";
import styles from "./JobLevel.module.css";
import { JobLevelGroup } from "@/models/job";
import { JobLevelCard } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelCard/JobLevelCard";
import {
  JobLevelAddCard
} from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelAddCard/JobLevelAddCard";

type JobLevelProps = {
  initialGroups: JobLevelGroup[];
};

export const JobLevel: React.FC<JobLevelProps> = ({ initialGroups }) => {
  const [groups, setGroups] = React.useState<JobLevelGroup[]>(initialGroups);

  const handleAddEmptyGroup = () => {
    setGroups((prev) => [
      ...prev,
      {
        id: `new-${crypto.randomUUID?.() ?? Date.now().toString()}`,
        name: "New group",
        levels: [],
      },
    ]);
  };

  return (
    <div className={styles.layout}>
      <section className={styles.cardsGrid} aria-label="Job level groups">
        {groups.map((group) => (
          <JobLevelCard key={group.id} group={group}/>
        ))}

        <JobLevelAddCard onClick={handleAddEmptyGroup}/>
      </section>
    </div>
  );
};
