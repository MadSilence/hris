"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { BalancePreview } from "./BalancePreview";
import { IMPORT_KINDS } from "./importKinds";
import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import {
  useApplyPeopleImport,
  useDiscardPeopleImport,
  useUpdatePeopleImport,
} from "@/components/modules/settings/modules/peopleImport/hooks";

type Props = { anImport: PeopleImportDTO };

/**
 * Step 4 (design § 3): what is about to happen, in the product's own words, and the one choice left —
 * whether everybody with an email is invited once the import is done (decision 5).
 */
export const ConfirmStep: React.FC<Props> = ({ anImport }) => {
  const t = useTranslations("peopleImport");
  const [error, setError] = useState<string | null>(null);
  const update = useUpdatePeopleImport();
  const apply = useApplyPeopleImport();
  const discard = useDiscardPeopleImport();
  const busy = update.isPending || apply.isPending || discard.isPending;
  const withEmail = anImport.rowCount - anImport.withoutEmailCount;

  const onInvite = (checked: boolean) => {
    setError(null);
    update.mutate({ id: anImport.id, body: { version: anImport.version, inviteAfter: checked } }, { onError: (e) => setError(messageForError(e)) });
  };

  const onApply = () => {
    setError(null);
    apply.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) });
  };

  // Changing the mapping again: saving it unchanged sends the import back to the Map step.
  const onBack = () => {
    setError(null);
    update.mutate({ id: anImport.id, body: { version: anImport.version, mapping: anImport.mapping } }, { onError: (e) => setError(messageForError(e)) });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="rounded-card border border-divider p-5">
        <p className="text-body font-medium text-primary">{t("confirm.noErrors", { fileName: anImport.fileName })}</p>
        {anImport.kind !== "PEOPLE_CREATE" && <KindSummary anImport={anImport} />}
        {anImport.kind === "PEOPLE_CREATE" && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-secondary">
          <li>{t.rich("confirm.willBeCreated", { count: anImport.rowCount, b: (chunks) => <strong>{chunks}</strong> })}</li>
          {anImport.startLaterCount > 0 && (
            <li>{t.rich("confirm.startLater", { count: anImport.startLaterCount, b: (chunks) => <strong>{chunks}</strong> })}</li>
          )}
          {anImport.withoutEmailCount > 0 && (
            <li>{t("confirm.withoutEmail", { count: anImport.withoutEmailCount })}</li>
          )}
          <li>{t("confirm.nobodyNotified")}</li>
        </ul>
        )}
      </div>

      {anImport.canInvite && withEmail > 0 && (
        <label className="flex items-start gap-3 text-body">
          <Checkbox
            checked={anImport.inviteAfter}
            disabled={busy}
            onCheckedChange={(checked) => onInvite(checked === true)}
            aria-label={t("confirm.inviteLabel")}
          />
          <span>
            <span className="font-medium text-primary">{t("confirm.inviteLabel")}</span>
            <span className="block text-tertiary">
              {t("confirm.inviteHint", { count: withEmail })}
            </span>
          </span>
        </label>
      )}

      <FormError message={error} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onApply} disabled={busy}>
          {apply.isPending
            ? t("confirm.starting")
            : t("confirm.importNoun", { noun: t(IMPORT_KINDS[anImport.kind].nounKey, { count: anImport.rowCount }) })}
        </Button>
        <Button type="button" variant="secondary" onClick={onBack} disabled={busy}>{t("confirm.changeMapping")}</Button>
        <Button type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => discard.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) })}
        >
          {t("confirm.discard")}
        </Button>
      </div>
    </div>
  );
};

const count = (n: number | undefined) => n ?? 0;

/** What a structure or balances file will do — the kind's own numbers from the check. */
const KindSummary: React.FC<Props> = ({ anImport }) => {
  const t = useTranslations("peopleImport");
  if (anImport.kind === "ORG_STRUCTURE") {
    const departments = count(anImport.summary.departments);
    const teams = count(anImport.summary.teams);
    return (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-secondary">
        <li>{t.rich("confirm.structureCreated", { departments, teams, b: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t("confirm.structureNobodyPlaced")}</li>
      </ul>
    );
  }
  const toSet = count(anImport.summary.toSet);
  const unchanged = count(anImport.summary.unchanged);
  return (
    <div className="mt-3 flex flex-col gap-3">
      <ul className="list-disc space-y-1 pl-5 text-body text-secondary">
        <li>{t.rich("confirm.balancesSet", { count: toSet, b: (chunks) => <strong>{chunks}</strong> })}</li>
        {unchanged > 0 && <li>{t("confirm.balancesUnchanged", { count: unchanged })}</li>}
        <li>{t("confirm.balancesAsOf")}</li>
      </ul>
      <BalancePreview importId={anImport.id} />
    </div>
  );
};
