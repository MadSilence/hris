"use client";

import { FC } from "react";
import { Ellipsis } from "lucide-react";

import { JobLevelGroup } from "@/models/job";
import { Button } from "@/public/desact/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";

type Props = {
  group: JobLevelGroup;
};

export const JobLevelCard: FC<Props> = ({ group }) => {
  const sortedLevels = [...group.levels].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <article className="rounded-xl border bg-white p-5">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {group.name}
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Job level group actions">
              <Ellipsis className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ul className="flex flex-col gap-2">
        {sortedLevels.map((level, index) => (
          <li
            key={level.id}
            className="flex items-center gap-3 rounded-lg bg-brown-50 px-3 py-2"
          >
            <span className="text-sm text-[var(--color-text-tertiary)]">
              {index + 1}.
            </span>

            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {level.name}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
