"use client";

import React from "react";
import { Plus } from "lucide-react";

import { JobLevel as JobLevelModel, JobLevelGroup } from "@/models/job";
import { Button } from "@/public/desact/src/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { JobLevelCard } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelCard/JobLevelCard";

export type JobLevelProps = {
  groups: JobLevelGroup[];
  managingGroupId: string | null;
  onToggleManaging: (groupId: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (group: JobLevelGroup) => void;
  onDeleteGroup: (group: JobLevelGroup) => void;
  onCreateLevel: (group: JobLevelGroup) => void;
  onEditLevel: (group: JobLevelGroup, level: JobLevelModel) => void;
  onDeleteLevel: (group: JobLevelGroup, level: JobLevelModel) => void;
  onMoveLevel: (group: JobLevelGroup, level: JobLevelModel, direction: -1 | 1) => void;
  isReordering?: boolean;
};

export const JobLevel: React.FC<JobLevelProps> = ({
  groups,
  managingGroupId,
  onToggleManaging,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onCreateLevel,
  onEditLevel,
  onDeleteLevel,
  onMoveLevel,
  isReordering,
}) => (
  <div className="space-y-8">
    <div className="flex items-start justify-between gap-4 pt-2 pb-1">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Job Level Groups <span className="font-normal text-brown-400">({groups.length})</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Group job levels into career tracks and define the progression employees move through
          within each.
        </p>
      </div>

      <PermissionGate resource="JOBS.LEVEL_GROUP" action="EDIT">
        <Button className="shrink-0 gap-1.5" onClick={onCreateGroup}>
          <Plus className="h-4 w-4"/>
          Add Job Group
        </Button>
      </PermissionGate>
    </div>

    {/* Only the cards scroll; the header above stays put. */}
    <div className="-mx-1 max-h-[calc(100svh-405px)] overflow-y-auto px-1">
      {groups.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">
          No career tracks yet.
        </p>
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {groups.map((group) => (
            <div key={group.id} data-group-id={group.id}>
              <JobLevelCard
                group={group}
                managing={managingGroupId === group.id}
                onToggleManaging={() => onToggleManaging(group.id)}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
                onCreateLevel={onCreateLevel}
                onEditLevel={onEditLevel}
                onDeleteLevel={onDeleteLevel}
                onMoveLevel={onMoveLevel}
                isReordering={isReordering}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
