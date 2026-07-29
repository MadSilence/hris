"use client";

import React from "react";
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
        isSystem: false,
      },
    ]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1 pt-2 pb-1">
        <h2 className="text-lg font-semibold text-foreground">
          Job Level Groups{" "}
          <span className="font-normal text-brown-400">({groups.length})</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Group job levels into career tracks and define the progression employees move through
          within each.
        </p>
      </div>

      {/* Only the cards scroll; the header above stays put. */}
      <div className="max-h-[calc(100svh-405px)] overflow-y-auto pr-1">
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {groups.map((group) => (
            <JobLevelCard key={group.id} group={group}/>
          ))}

          <JobLevelAddCard onClick={handleAddEmptyGroup}/>
        </div>
      </div>
    </div>
  );
};
