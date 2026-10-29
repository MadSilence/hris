"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import { useInvitePeopleImport } from "@/components/modules/settings/modules/peopleImport/hooks";
import { CheckErrors } from "./CheckErrors";
import { IMPORT_KINDS } from "./importKinds";

type Props = {
  anImport: PeopleImportDTO;
  onStartAnother: () => void;
};

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/**
 * Step 6 (design § 3): what was created, what failed and why, the invitations. A row fails here only
 * when something changed after the check — and when one did, the invitations were held back, so the
 * report offers them instead (design § 9).
 */
export const ReportStep: React.FC<Props> = ({ anImport, onStartAnother }) => {
  const invite = useInvitePeopleImport();
  const [error, setError] = useState<string | null>(null);

  if (anImport.status === "FAILED") {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-medium text-brown-800">The import of {anImport.fileName} stopped.</p>
        {anImport.errorDetail && <p className="text-sm text-muted-foreground">{anImport.errorDetail}</p>}
        {anImport.kind !== "PEOPLE_CREATE" && <CheckErrors anImport={anImport} />}
        <p className="text-sm text-muted-foreground">
          {anImport.kind === "PEOPLE_CREATE"
            ? `${people(anImport.createdCount)} had been created before it stopped. They are in the People table as drafts.`
            : "Nothing was written: this file is applied whole or not at all. Fix what changed and import it again."}
        </p>
        <div><Button type="button" onClick={onStartAnother}>Import Another File</Button></div>
      </div>
    );
  }

  const offerInvitations = anImport.canInvite && anImport.createdCount > 0 && anImport.invitedCount === 0;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="rounded-lg border border-brown-200 p-5">
        <p className="text-sm font-medium text-brown-800">
          {IMPORT_KINDS[anImport.kind].noun(anImport.createdCount)} imported from {anImport.fileName}.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brown-700">
          {anImport.failedCount > 0 && (
            <li>{anImport.failedCount} {anImport.failedCount === 1 ? "row was" : "rows were"} not created — something changed after the check.</li>
          )}
          {anImport.unchangedCount > 0 && (
            <li>{anImport.unchangedCount} {anImport.unchangedCount === 1 ? "balance was" : "balances were"} already at the target.</li>
          )}
          {anImport.invitedCount > 0 && <li>{people(anImport.invitedCount)} invited.</li>}
          {anImport.inviteAfter && anImport.invitedCount === 0 && anImport.failedCount > 0 && (
            <li>No invitations were sent, because a row failed.</li>
          )}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {anImport.kind === "PEOPLE_CREATE" && (
            <Button asChild variant="outline" size="sm">
              <Link href="/organization/people">Open People</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/admin/logs">See it in the Logs</Link>
          </Button>
        </div>
      </div>

      <FormError message={error} />

      {offerInvitations && (
        <div>
          <Button type="button"
            variant="outline"
            disabled={invite.isPending}
            onClick={() => {
              setError(null);
              invite.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) });
            }}
          >
            {invite.isPending
              ? "Sending…"
              : `Invite the ${anImport.createdCount} ${anImport.createdCount === 1 ? "Person" : "People"} Created`}
          </Button>
        </div>
      )}

      {anImport.status === "COMPLETED_WITH_FAILURES" && <CheckErrors anImport={anImport} />}

      <div><Button type="button" onClick={onStartAnother}>Import Another File</Button></div>
    </div>
  );
};
