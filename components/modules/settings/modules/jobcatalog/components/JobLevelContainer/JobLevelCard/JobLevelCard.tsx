"use client";

import { FC, ReactNode, useState } from "react";
import { ArrowRight, Briefcase, Users } from "lucide-react";

import { JobLevelGroup } from "@/models/job";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Separator } from "@/public/desact/src/components/ui/separator";

type Props = {
  group: JobLevelGroup;
};

const DEFAULT_VISIBLE = 4;

export const JobLevelCard: FC<Props> = ({ group }) => {
  const [expanded, setExpanded] = useState(false);

  const sortedLevels = [...group.levels].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasMore = sortedLevels.length > DEFAULT_VISIBLE;
  const visibleLevels = expanded ? sortedLevels : sortedLevels.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = sortedLevels.length - DEFAULT_VISIBLE;
  const showMoreRow = hasMore && !expanded;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-brown-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <h3 className="truncate text-lg font-semibold text-foreground">{group.name}</h3>
        {group.isSystem ? (
          <Badge variant="secondary" className="shrink-0 font-normal">
            Preset
          </Badge>
        ) : null}
      </header>

      {/* Statistics */}
      <div className="mt-4 flex items-stretch">
        <Stat icon={<Users className="h-6 w-6"/>} value="—" label="Employees"/>
        <div className="mx-4 w-px bg-brown-200"/>
        <Stat
          icon={<Briefcase className="h-6 w-6"/>}
          value={String(sortedLevels.length)}
          label={sortedLevels.length === 1 ? "Position" : "Positions"}
        />
      </div>

      <Separator className="my-5"/>

      {/* Levels — vertical career progression */}
      <div className="flex-1">
        {sortedLevels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No levels yet</p>
        ) : (
          <ol>
            {visibleLevels.map((level, index) => {
              const isConnectorToMore = showMoreRow && index === visibleLevels.length - 1;
              const connectorBelow = index < visibleLevels.length - 1 || showMoreRow;

              return (
                <li key={level.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-brown-400 bg-white"/>
                    {connectorBelow ? (
                      isConnectorToMore ? (
                        <span className="my-1 w-0 flex-1 border-l border-dashed border-brown-300"/>
                      ) : (
                        <span className="my-1 w-px flex-1 bg-brown-200"/>
                      )
                    ) : null}
                  </div>

                  <div className={connectorBelow ? "pb-4" : ""}>
                    <p className="text-sm font-medium text-foreground">{level.name}</p>
                  </div>
                </li>
              );
            })}

            {showMoreRow ? (
              <li className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-brown-300 bg-brown-50"/>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="rounded-md bg-brown-50 px-2 py-1 text-sm font-medium text-brown-600 transition-colors hover:bg-brown-100"
                >
                  +{hiddenCount} more levels
                </button>
              </li>
            ) : null}
          </ol>
        )}

        {expanded && hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 text-sm font-medium text-brown-600 transition-colors hover:text-brown-700"
          >
            Show less
          </button>
        ) : null}
      </div>

      {/* Footer action */}
      <Separator className="mt-5"/>
      <Button
        variant="ghost"
        className="group mt-1 w-full justify-between px-2 text-brown-600 hover:bg-brown-50 hover:text-brown-700"
      >
        <span className="text-sm font-medium">Manage Group</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"/>
      </Button>
    </article>
  );
};

const Stat = ({ icon, value, label }: { icon: ReactNode; value: string; label: string }) => (
  <div className="flex flex-1 items-center gap-3">
    <span className="text-brown-400">{icon}</span>
    <div>
      <p className="text-xl font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);
