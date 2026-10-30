"use client";

import React, { useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
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

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/**
 * Step 4 (design § 3): what is about to happen, in the product's own words, and the one choice left —
 * whether everybody with an email is invited once the import is done (decision 5).
 */
export const ConfirmStep: React.FC<Props> = ({ anImport }) => {
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
      <div className="rounded-lg border border-brown-200 p-5">
        <p className="text-sm font-medium text-brown-800">{anImport.fileName} has no errors.</p>
        {anImport.kind !== "PEOPLE_CREATE" && <KindSummary anImport={anImport} />}
        {anImport.kind === "PEOPLE_CREATE" && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brown-700">
          <li><strong>{people(anImport.rowCount)}</strong> will be created, each as a draft profile.</li>
          {anImport.startLaterCount > 0 && (
            <li>
              {people(anImport.startLaterCount)} {anImport.startLaterCount === 1 ? "has" : "have"} a hire date after today,
              so they are <strong>Not started</strong> until then.
            </li>
          )}
          {anImport.withoutEmailCount > 0 && (
            <li>
              {people(anImport.withoutEmailCount)} {anImport.withoutEmailCount === 1 ? "has" : "have"} no email: they
              cannot be invited, and uploading this file again would create them again.
            </li>
          )}
          <li>Nobody is notified. Onboarding does not start by itself.</li>
        </ul>
        )}
      </div>

      {anImport.canInvite && withEmail > 0 && (
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={anImport.inviteAfter}
            disabled={busy}
            onCheckedChange={(checked) => onInvite(checked === true)}
            aria-label="Invite everybody with an email once the import is done"
          />
          <span>
            <span className="font-medium text-brown-800">Invite everybody with an email once the import is done</span>
            <span className="block text-muted-foreground">
              {people(withEmail)} will get an invitation to sign in — only after every row has been created.
            </span>
          </span>
        </label>
      )}

      <FormError message={error} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onApply} disabled={busy}>
          {apply.isPending ? "Starting…" : `Import ${IMPORT_KINDS[anImport.kind].noun(anImport.rowCount)}`}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}>Change Mapping</Button>
        <Button type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => discard.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) })}
        >
          Discard Import
        </Button>
      </div>
    </div>
  );
};

const count = (n: number | undefined) => n ?? 0;

/** What a structure or balances file will do — the kind's own numbers from the check. */
const KindSummary: React.FC<Props> = ({ anImport }) => {
  if (anImport.kind === "ORG_STRUCTURE") {
    const departments = count(anImport.summary.departments);
    const teams = count(anImport.summary.teams);
    return (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brown-700">
        <li>
          <strong>{departments} {departments === 1 ? "department" : "departments"}</strong> and{" "}
          <strong>{teams} {teams === 1 ? "team" : "teams"}</strong> will be created, parents first, all at once.
        </li>
        <li>Nobody is placed in them yet: the people import does that.</li>
      </ul>
    );
  }
  const toSet = count(anImport.summary.toSet);
  const unchanged = count(anImport.summary.unchanged);
  return (
    <div className="mt-3 flex flex-col gap-3">
      <ul className="list-disc space-y-1 pl-5 text-sm text-brown-700">
        <li><strong>{toSet} {toSet === 1 ? "balance" : "balances"}</strong> will be set, all at once.</li>
        {unchanged > 0 && <li>{unchanged} {unchanged === 1 ? "is" : "are"} already at the target and will not change.</li>}
        <li>Each balance is set as of its date. Leave already booked for later dates is subtracted on its own.</li>
      </ul>
      <BalancePreview importId={anImport.id} />
    </div>
  );
};
