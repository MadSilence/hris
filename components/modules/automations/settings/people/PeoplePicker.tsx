"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { Illustration } from "@/components/illustrations";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useUser } from "@/components/hooks/useUser/useUser";
import { emptySegment, type UserRefDTO } from "@/models/segment/Segment";
import type { AutomationCatalog, AutomationEventOption, RecipientSpec } from "@/models/automations";
import { cn } from "@/lib/cn";
import { ListError, ListLoading } from "../parts/parts";
import { addRecipient, recipientKey, removeRecipient, roleChoices, splitMatch, includesRecipient } from "./recipients";

export type PeoplePickerProps = {
  value: RecipientSpec[];
  onChange: (value: RecipientSpec[]) => void;
  catalog: Pick<AutomationCatalog, "recipientKinds" | "roles">;
  /** The trigger's event, when it is one: a time-off event adds "The approver". */
  event?: Pick<AutomationEventOption, "recipientKinds"> | null;
  /** One recipient (an assignee, a reviewer) or several (who gets it). */
  mode?: "single" | "multiple";
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  invalid?: boolean;
  disabled?: boolean;
};

const fullName = (u: { firstName?: string | null; lastName?: string | null; email?: string | null }) =>
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

type OrgRef = { id: string; name: string };
/** "job · office" — what the people search returns of them (it sends the office; a job only if it ever does). */
const placeOf = (u: UserRefDTO): string =>
  [u.extras?.job as OrgRef | undefined, u.extras?.office as OrgRef | undefined]
    .map((r) => r?.name)
    .filter(Boolean)
    .join(" · ");

/** A recipient's name, as a chip and as a list row. */
export const useRecipientLabel = (catalog: Pick<AutomationCatalog, "roles">) => {
  const tA = useTranslations("automations");
  return (r: RecipientSpec): string => {
    if (r.kind === "ROLE") return catalog.roles.find((x) => x.id === r.roleId)?.name ?? tA("recipient.ROLE");
    return tA(`recipient.${r.kind}`);
  };
};

const Bolded: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const parts = splitMatch(text, query);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <span className="font-semibold">{parts[1]}</span>
      {parts[2]}
    </>
  );
};

/**
 * Who gets it, who approves, who does it (S1b, S1c; PRODUCT-RULES § Controls): the picks as chips inside the field,
 * no placeholder; the list in two parts — Roles (the person, their manager, their manager's manager, department
 * head, onboarding manager, the company's roles) and People A–Z with their avatar and "job · office". Typing filters
 * both and the typed letters are bold. Values are `RecipientSpec`s — a person is `USER` with their id.
 *
 * <p>Keyboard: the field is a combobox — arrows move through the list, Enter picks, Escape closes, Backspace in an
 * empty field removes the last chip.
 */
export const PeoplePicker: React.FC<PeoplePickerProps> = ({
  value,
  onChange,
  catalog,
  event,
  mode = "multiple",
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  invalid,
  disabled,
}) => {
  const t = useTranslations("automationsSettings");
  const label = useRecipientLabel(catalog);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();
  const debounced = useDebouncedValue(query, 250);
  const people = useSegmentResolve(emptySegment(), open, debounced, ["office"]);

  const q = query.trim().toLocaleLowerCase();
  const roles = roleChoices(catalog, event)
    .filter((r) => mode === "single" || !includesRecipient(value, r))
    .filter((r) => !q || label(r).toLocaleLowerCase().includes(q));
  const picked = new Set(value.filter((r) => r.kind === "USER").map((r) => r.userId));
  const found = people.items.filter((u) => mode === "single" || !picked.has(u.id));
  const options: { key: string; spec: RecipientSpec }[] = [
    ...roles.map((r) => ({ key: recipientKey(r), spec: r })),
    ...found.map((u) => ({ key: `USER:${u.id}`, spec: { kind: "USER" as const, userId: u.id } })),
  ];

  React.useEffect(() => setActive(0), [query, open]);

  const pick = (spec: RecipientSpec) => {
    onChange(addRecipient(value, spec, mode));
    setQuery("");
    // The rows keep the focus in the field (mousedown is prevented), so nothing has to put it back.
    if (mode === "single") setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(options.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && options[active]) {
        e.preventDefault();
        pick(options[active].spec);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (people.hasNextPage && !people.isFetchingNextPage && el.scrollHeight - el.scrollTop - el.clientHeight < 96) {
      void people.fetchNextPage();
    }
  };

  const activeKey = options[active]?.key;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          onClick={() => {
            if (disabled) return;
            inputRef.current?.focus();
            setOpen(true);
          }}
          data-invalid={invalid || undefined}
          className={cn(
            "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1 rounded-control border border-field bg-card px-1.5 py-1",
            "transition-[border-color,box-shadow] hover:border-field-hover focus-within:border-accent focus-within:shadow-focus",
            "data-[invalid]:border-danger",
            disabled && "cursor-not-allowed bg-subtle",
          )}
        >
          {value.map((r) => (
            <RecipientChip
              key={recipientKey(r)}
              spec={r}
              label={label}
              disabled={disabled}
              onRemove={() => onChange(removeRecipient(value, r))}
            />
          ))}
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && activeKey ? `${listId}-${activeKey}` : undefined}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-6 min-w-12 flex-1 bg-transparent px-1 text-body text-primary outline-none"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // A click back in the field keeps the list open.
          if (e.target instanceof Node && inputRef.current?.parentElement?.contains(e.target)) e.preventDefault();
        }}
      >
        <div id={listId} role="listbox" aria-label={ariaLabel} className="max-h-80 overflow-y-auto p-1" onScroll={onScroll}>
          {roles.length > 0 && (
            <div role="group" aria-label={t("people.roles")}>
              <p className="px-2 pb-1 pt-2 text-hint font-medium text-tertiary">{t("people.roles")}</p>
              {roles.map((r) => {
                const key = recipientKey(r);
                return (
                  <div
                    key={key}
                    id={`${listId}-${key}`}
                    role="option"
                    aria-selected={key === activeKey}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(r)}
                    className={cn(
                      "flex min-h-9 cursor-default items-center gap-2 rounded-control px-2 py-1.5 text-body",
                      key === activeKey ? "bg-accent-subtle" : "hover:bg-accent-subtle",
                    )}
                  >
                    {/* Name over its hint, as S1b draws it: side by side in a 340 window the hint pushed the name to
                        "Their manag…" (walk of 2026-11-07). */}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">
                        <Bolded text={label(r)} query={query} />
                      </span>
                      <span className="truncate text-hint text-tertiary">{roleHint(t, r)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div role="group" aria-label={q ? t("people.people") : t("people.peopleAZ")}>
            {(found.length > 0 || people.isLoading) && (
              <p className="px-2 pb-1 pt-2 text-hint font-medium text-tertiary">{q ? t("people.people") : t("people.peopleAZ")}</p>
            )}
            {people.isLoading ? (
              <ListLoading />
            ) : people.isError ? (
              <ListError onRetry={() => void people.refetch()} />
            ) : (
              found.map((u) => {
                const key = `USER:${u.id}`;
                const name = fullName(u);
                const place = placeOf(u);
                return (
                  <div
                    key={key}
                    id={`${listId}-${key}`}
                    role="option"
                    aria-selected={key === activeKey}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick({ kind: "USER", userId: u.id })}
                    className={cn(
                      "flex min-h-11 cursor-default items-center gap-2 rounded-control px-2 py-1 text-body",
                      key === activeKey ? "bg-accent-subtle" : "hover:bg-accent-subtle",
                    )}
                  >
                    <Avatar className="size-7 shrink-0">
                      {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
                      <AvatarFallback className="text-hint">{initials(name)}</AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">
                        <Bolded text={name} query={query} />
                      </span>
                      {place && <span className="truncate text-hint text-tertiary">{place}</span>}
                    </span>
                  </div>
                );
              })
            )}
            {people.isFetchingNextPage && <ListLoading />}
          </div>
          {!people.isLoading && !people.isError && roles.length === 0 && found.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-3 py-5 text-body text-secondary">
              <Illustration scene="no-results-s" size="s" />
              {t("people.noOne")}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const roleHint = (t: ReturnType<typeof useTranslations<"automationsSettings">>, r: RecipientSpec): string => {
  switch (r.kind) {
    case "PERSON":
      return t("people.hint.person");
    case "ROLE":
      return t("people.hint.role");
    case "APPROVER":
      return t("people.hint.approver");
    default:
      return t("people.hint.relative");
  }
};

/** A pick inside the field: one line, an ellipsis and a tooltip when long, × to remove. */
const RecipientChip: React.FC<{
  spec: RecipientSpec;
  label: (r: RecipientSpec) => string;
  disabled?: boolean;
  onRemove: () => void;
}> = ({ spec, label, disabled, onRemove }) => {
  const t = useTranslations("automationsSettings");
  const text = spec.kind === "USER" ? <UserName id={spec.userId ?? ""} /> : label(spec);
  const name = typeof text === "string" ? text : null;
  return (
    <span className="inline-flex h-6 max-w-full items-center gap-1 rounded-tag bg-mist pl-2 pr-0.5 text-label text-primary">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="max-w-48 truncate">{text}</span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={name ? t("people.removeNamed", { name }) : t("people.remove")}
          className="inline-flex size-5 items-center justify-center rounded-control text-tertiary hover:bg-divider hover:text-secondary"
        >
          <Icon icon={Cancel01Icon} size="sm" />
        </button>
      )}
    </span>
  );
};

/** A person picked by id: the name is read back. */
export const UserName: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations("automationsSettings");
  const { data } = useUser(id);
  return <>{data ? fullName(data) : t("conditions.aPerson")}</>;
};
