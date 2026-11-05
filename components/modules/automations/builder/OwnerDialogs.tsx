"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { FormError } from "@/components/feedback/FormError";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { PersonRef } from "@/models/automations";

/**
 * Change Owner (E3): the rule is handed to somebody who may manage automations and could publish it themself — the
 * backend checks both and says which failed.
 */
export function ChangeOwnerDialog({
  isOpen,
  isLoading,
  errorMessage,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onConfirm: (userId: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const [picked, setPicked] = useState<PickedUser | null>(null);
  useEffect(() => { if (isOpen) setPicked(null); }, [isOpen]);
  const userId = picked?.id ?? null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("rule.menu.changeOwner")}</DialogTitle>
          <DialogDescription>{t("owner.changeDescription")}</DialogDescription>
        </DialogHeader>
        <UserPickerField value={picked} onChange={setPicked} />
        <FormError message={errorMessage} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => userId && onConfirm(userId)} disabled={isLoading || !userId}>
            {isLoading ? t("owner.changing") : t("rule.menu.changeOwner")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "Also tell" (E4): people told of a failure or a pause besides the owner. */
export function AlsoTellDialog({
  isOpen,
  current,
  isLoading,
  errorMessage,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  current: PersonRef[];
  isLoading: boolean;
  errorMessage: string | null;
  onConfirm: (userIds: string[]) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const [people, setPeople] = useState<PersonRef[]>(current);
  useEffect(() => { if (isOpen) setPeople(current); }, [isOpen, current]);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("owner.alsoTitle")}</DialogTitle>
          <DialogDescription>{t("owner.alsoDescription")}</DialogDescription>
        </DialogHeader>
        <ul className="m-0 list-none space-y-1 p-0">
          {people.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-body text-primary">
              {p.name ?? p.id}
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t("owner.removePerson", { name: p.name ?? "" })}
                onClick={() => setPeople(people.filter((x) => x.id !== p.id))}>
                <Icon icon={Cancel01Icon} size="sm" />
              </Button>
            </li>
          ))}
        </ul>
        <UserPickerField
          value={null}
          onChange={(u) => {
            if (u && !people.some((p) => p.id === u.id)) {
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || null;
              setPeople([...people, { id: u.id, name }]);
            }
          }}
        />
        <FormError message={errorMessage} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => onConfirm(people.map((p) => p.id))} disabled={isLoading}>
            {isLoading ? tCommon("actions.saving") : tCommon("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
