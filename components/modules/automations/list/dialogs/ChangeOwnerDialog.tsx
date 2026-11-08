"use client";

import * as React from "react";
import { ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Banner, InlineAlert } from "@/components/desact/alert";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { NodRing } from "@/components/desact/nod";
import { PersonAvatar } from "@/components/modules/automations/shared";
import type { AutomationSummary } from "@/models/automations";
import { cn } from "@/lib/cn";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useOwnerCandidates, type OwnerCandidate } from "./useOwnerCandidates";

/**
 * Change owner (O1 → O2): the owner now, then a single-person picker of people who may manage automations.
 * "Change owner" stays off until somebody is picked; once picked, a note says what happens to runs going.
 */
export const ChangeOwnerDialog: React.FC<{
  automation: AutomationSummary | null;
  busy: boolean;
  error: string | null;
  onConfirm: (owner: OwnerCandidate) => void;
  onCancel: () => void;
}> = ({ automation, busy, error, onConfirm, onCancel }) => {
  const t = useTranslations("automationsList");
  const tCommon = useTranslations("common");
  const [picked, setPicked] = React.useState<OwnerCandidate | null>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const debounced = useDebouncedValue(query, 250);
  const candidates = useOwnerCandidates(debounced, Boolean(automation) && open);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    if (!automation) {
      setPicked(null);
      setQuery("");
      setOpen(false);
    }
  }, [automation]);

  const currentOwnerId = automation?.owner?.id ?? null;
  const people = (candidates.data ?? []).filter((person) => person.id !== currentOwnerId);
  const firstName = picked?.name.split(/\s+/)[0] ?? "";

  const pick = (person: OwnerCandidate) => {
    setPicked(person);
    setQuery("");
    setOpen(false);
  };

  return (
    <Dialog
      open={Boolean(automation)}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <DialogContent size="sm" className="bg-card" hideClose>
        <DialogHeader className="pr-0">
          <DialogTitle className="break-words">{t("changeOwner.title", { name: automation?.name ?? "" })}</DialogTitle>
          <DialogDescription>{t("changeOwner.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {automation?.owner ? (
            <div className="flex items-center gap-3 rounded-popover bg-subtle px-3 py-2.5">
              <PersonAvatar name={automation.owner.name} size={28} />
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-primary">{automation.owner.name}</p>
                <p className="text-hint text-tertiary">{t("changeOwner.ownerNow")}</p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={listId} className="text-label text-primary">{t("changeOwner.label")}</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverAnchor asChild>
                <div
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-control border bg-card px-2",
                    open ? "border-accent shadow-focus" : "border-field hover:border-field-hover",
                  )}
                  onClick={() => {
                    setOpen(true);
                    inputRef.current?.focus();
                  }}
                >
                  {picked ? (
                    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-pill bg-subtle pr-1 pl-0.5 text-body text-primary">
                      <PersonAvatar name={picked.name} avatarUrl={picked.avatarUrl} size={24} />
                      {picked.name}
                      <button
                        type="button"
                        aria-label={t("changeOwner.remove", { name: picked.name })}
                        className="inline-flex size-4 items-center justify-center rounded-pill text-tertiary hover:text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPicked(null);
                        }}
                      >
                        <Icon icon={Cancel01Icon} size="sm" className="size-3" />
                      </button>
                    </span>
                  ) : null}
                  <input
                    ref={inputRef}
                    id={listId}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${listId}-list`}
                    aria-describedby={`${listId}-hint`}
                    value={query}
                    placeholder={picked ? "" : t("changeOwner.searchPlaceholder")}
                    onChange={(event) => {
                      setQuery(event.currentTarget.value);
                      setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && open && people[0]) {
                        event.preventDefault();
                        pick(people[0]);
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-tertiary"
                  />
                  <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
                </div>
              </PopoverAnchor>
              <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-1"
                onOpenAutoFocus={(event) => event.preventDefault()}
                onInteractOutside={(event) => {
                  if (event.target instanceof Node && inputRef.current?.parentElement?.contains(event.target)) event.preventDefault();
                }}
              >
                <p className="px-2.5 pt-1.5 pb-1 text-hint text-tertiary">{t("changeOwner.group")}</p>
                <ul id={`${listId}-list`} role="listbox" className="max-h-72 overflow-y-auto">
                  {candidates.isLoading ? (
                    <li className="flex justify-center py-4">
                      <NodRing size="sm" />
                    </li>
                  ) : people.length === 0 ? (
                    <li className="px-2.5 py-3 text-body text-tertiary">{t("changeOwner.noResults")}</li>
                  ) : (
                    people.map((person) => (
                      <li key={person.id} role="option" aria-selected={picked?.id === person.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-control px-2.5 py-2 text-left hover:bg-subtle"
                          onClick={() => pick(person)}
                        >
                          <PersonAvatar name={person.name} avatarUrl={person.avatarUrl} size={28} />
                          <span className="min-w-0">
                            <span className="block truncate text-body text-primary">{person.name}</span>
                            {person.detail ? <span className="block truncate text-hint text-tertiary">{person.detail}</span> : null}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </PopoverContent>
            </Popover>
            <p id={`${listId}-hint`} className="text-hint text-tertiary">{t("changeOwner.hint")}</p>
          </div>

          {picked ? <Banner>{t("changeOwner.note", { firstName })}</Banner> : null}
          {error ? <InlineAlert tone="declined">{error}</InlineAlert> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" disabled={!picked} loading={busy} onClick={() => picked && onConfirm(picked)}>
            {busy ? t("changeOwner.busy") : t("changeOwner.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
