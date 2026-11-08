"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";

import { JobLevel as JobLevelModel, JobLevelGroup } from "@/models/job";
import { Button } from "@/components/desact/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { JobLevelCard } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelCard/JobLevelCard";
import { JobLevelSkeleton } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevel/JobLevelSkeleton";

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
  /** The header and toolbar stay put while the cards fill in. */
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const t = useTranslations("structure.jobLevels");
  const [query, setQuery] = useState("");

  /* A track matches on its own name or on any level inside it — looking for "Senior" should find
     the track that has a Senior level, not just a track called Senior. */
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(needle) ||
        (group.levels ?? []).some((level) => level.name.toLowerCase().includes(needle)),
    );
  }, [groups, query]);

  const addButton = (
    <PermissionGate resource="JOBS.LEVEL_GROUP" action="EDIT">
      <Button type="button" className="shrink-0 gap-1.5" onClick={onCreateGroup}>
        <Icon icon={Add01Icon} size="sm" />
        {t("addTrack")}
      </Button>
    </PermissionGate>
  );

  return (
  <div className="space-y-8">
    <div className="space-y-4 pt-2 pb-1">
      <div className="space-y-1">
        <h2 className="text-section-title text-primary">
          {t.rich("heading", {
            count: groups.length,
            muted: (chunks) => <span className="font-normal text-tertiary">{chunks}</span>,
          })}
        </h2>
        <p className="text-body text-tertiary">
          {t("intro")}
        </p>
      </div>

      <ListToolbar search={{ value: query, onChange: setQuery }} primary={addButton}/>
    </div>

    {/* Only the cards scroll; the header above stays put. */}
    <div className="-mx-1 max-h-[calc(100svh-405px)] overflow-y-auto px-1">
      {isLoading ? (
        <JobLevelSkeleton/>
      ) : visible.length === 0 ? (
        <ListEmptyState
          query={query}
          scene="career"
          title={t("empty.title")}
          description={t("empty.description")}
          noResultsHint={t("empty.noResultsHint")}
          onCreate={onCreateGroup}
          createLabel={t("addTrack")}
          createAccess={{ resource: "JOBS.LEVEL_GROUP" }}
        />
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {visible.map((group) => (
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
};
