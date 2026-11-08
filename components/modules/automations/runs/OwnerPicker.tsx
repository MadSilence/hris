"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { NodRing } from "@/components/desact/nod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { SearchBox } from "@/components/ui/SearchBox";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { emptySegment, type UserRefDTO } from "@/models/segment/Segment";
import { initialsOf } from "./runWords";

const nameOf = (u: UserRefDTO): string => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "";

const EVERYONE = emptySegment();

/**
 * "Choose an owner" under a failed task or review step: the primary button opens a people picker — one person, the
 * directory's search, as the settings' user picker reads it.
 */
export const OwnerPicker: React.FC<{ busy: boolean; onPick: (userId: string) => void }> = ({ busy, onPick }) => {
  const t = useTranslations("automationsRuns");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query, 300);
  const people = useSegmentResolve(EVERYONE, open, q);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (!people.hasNextPage || people.isFetchingNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) void people.fetchNextPage();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" loading={busy} disabled={busy}>
          {t("run.chooseOwner")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <div className="border-b border-divider p-2">
          <SearchBox value={query} onChange={setQuery} fullWidth />
        </div>
        <div className="max-h-64 overflow-y-auto p-1" onScroll={onScroll}>
          {people.isLoading ? (
            <div className="flex justify-center py-6">
              <NodRing label={t("run.pickerLoading")} />
            </div>
          ) : people.items.length === 0 ? (
            <p className="px-2 py-6 text-center text-body text-tertiary">{t("run.pickerEmpty")}</p>
          ) : (
            people.items.map((person) => {
              const name = nameOf(person);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onPick(person.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left hover:bg-subtle"
                >
                  <Avatar className="size-6">
                    {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
                    <AvatarFallback name={name} className="text-hint">
                      {initialsOf(name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-body text-primary">{name}</span>
                </button>
              );
            })
          )}
          {people.isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <NodRing size="sm" label={t("run.pickerLoading")} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
