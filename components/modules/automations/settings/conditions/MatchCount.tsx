"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";

type Count = { matching: number; people: { id: string | null; name: string | null }[] };

export const initialsOf = (name: string | null): string => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const two = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return two.toUpperCase() || "?";
};

/**
 * "48 people match · See who" on accent-subtle, radius 10 (`automations-editor` § Values): the first three faces, the
 * count, and a popover with the people the check returned.
 */
export const MatchCount: React.FC<{ count: Count }> = ({ count }) => {
  const t = useTranslations("automationsSettings");
  const faces = count.people.slice(0, 3);
  return (
    <div className="flex items-center gap-3 rounded-popover bg-accent-subtle px-3 py-2.5">
      {faces.length > 0 && (
        <div className="flex shrink-0 -space-x-1.5" aria-hidden>
          {faces.map((p, i) => (
            <Avatar key={p.id ?? i} className="size-6 border-2 border-accent-subtle">
              <AvatarFallback className="text-hint">{initialsOf(p.name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
      <span className="min-w-0 flex-1 text-body font-medium text-primary">{t("who.match", { count: count.matching })}</span>
      {count.matching > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="link" size="sm" className="text-label">
              {t("who.seeWho")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="max-h-80 w-64 overflow-y-auto p-2">
            <ul className="flex flex-col">
              {count.people.map((p, i) => (
                <li key={p.id ?? i} className="flex items-center gap-2 rounded-control px-2 py-1.5 text-body">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-hint">{initialsOf(p.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{p.name ?? t("conditions.aPerson")}</span>
                </li>
              ))}
              {count.matching > count.people.length && (
                <li className="px-2 py-1.5 text-hint text-tertiary">
                  {t("who.andMore", { count: count.matching - count.people.length })}
                </li>
              )}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
