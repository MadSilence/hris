"use client";

import * as React from "react";
import { Plus, Users } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/public/desact/src/components/ui/dialog";

import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { usePeopleSearch } from "@/components/modules/organization/hooks/usePeopleSearch";
import { UsersSearchItemDTO } from "@/models/user/fields";

const PAGE_SIZE = 20;

type RuleType = "include" | "exclude" | "condition";

const RULES: Array<{
  value: RuleType;
  title: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: "include",
    title: "Always include",
    description: "These users will always get the role.",
  },
  {
    value: "exclude",
    title: "Always exclude",
    description: "These users will never get the role.",
  },
  {
    value: "condition",
    title: "Condition based rule",
    description: "Build a rule based on user attributes (coming soon).",
    disabled: true,
  },
];

function displayName(u: UsersSearchItemDTO) {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return name.length ? name : u.email;
}

export function AddRoleRuleModal({
  triggerLabel = "Add rule",
  onSubmit,
}: {
  triggerLabel?: string;
  onSubmit?: (payload: { type: RuleType; userIds: string[] }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [ruleType, setRuleType] = React.useState<RuleType>("include");

  // search
  const [query, setQuery] = React.useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const qForApi = debouncedQ.length >= 2 ? debouncedQ : null;

  const showUserSearch = ruleType === "include" || ruleType === "exclude";

  const { data, isLoading, error } = usePeopleSearch({
    limit: PAGE_SIZE,
    cursor: null,
    q: showUserSearch ? qForApi : null,
    sortField: "last_name",
    sortDir: "asc",
    selectedFields: null,
    filters: null,
  } as any);

  if (error) throw error;

  const rows: UsersSearchItemDTO[] = (data?.items ?? []) as any;

  // selection
  const [selected, setSelected] = React.useState<UsersSearchItemDTO[]>([]);

  const selectedIds = React.useMemo(() => new Set(selected.map((u) => u.id)), [selected]);

  function resetState() {
    setRuleType("include");
    setQuery("");
    setSelected([]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetState();
  }

  function addUser(u: UsersSearchItemDTO) {
    setSelected((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]));
  }

  function removeUser(id: string) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  // очищаем поиск при смене типа правила (приятнее по UX)
  React.useEffect(() => {
    setQuery("");
    setSelected([]); // можно убрать, если хочешь сохранять выбранных при переключении include/exclude
  }, [ruleType]);

  const canSubmit = showUserSearch ? selected.length > 0 : false;

  function handleSubmit() {
    // дальше ты подключишь реальный create API / мутацию
    onSubmit?.({ type: ruleType, userIds: selected.map((u) => u.id) });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="text-white">
          <Plus className="w-4 h-4 mr-2"/>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white px-8 py-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brown-600"/>
            Add Role Rule
          </DialogTitle>
          <DialogDescription>
            Choose a rule type on the left. Search and select users on the right.
          </DialogDescription>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[360px_1fr]">
          {/* LEFT: rule type */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Rule type</div>

            <RadioGroup value={ruleType} onValueChange={(v) => setRuleType(v as RuleType)} className="gap-4">
              {RULES.map((r) => {
                const disabled = !!r.disabled;

                return (
                  <div
                    key={r.value}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                      !disabled && "cursor-pointer hover:bg-accent/40",
                      disabled && "opacity-60 cursor-not-allowed",
                    )}
                    onClick={() => {
                      if (!disabled) setRuleType(r.value);
                    }}
                    role="button"
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                      if (disabled) return;
                      if (e.key === "Enter" || e.key === " ") setRuleType(r.value);
                    }}
                  >
                    <RadioGroupItem value={r.value} disabled={disabled}/>
                    <div className="grid gap-1">
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-sm text-muted-foreground">{r.description}</div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* RIGHT: search + selected mini-table */}
          <div className="space-y-4">
            {showUserSearch ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {ruleType === "include" ? "Users to include" : "Users to exclude"}
                  </div>

                  <Input
                    placeholder="Search users (min 2 chars)…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

              </>
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Condition builder will be added next.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button className="text-white" disabled={!canSubmit} onClick={handleSubmit}>
            Add rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
