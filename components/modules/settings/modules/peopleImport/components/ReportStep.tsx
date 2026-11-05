"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/desact/button";
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

/**
 * Step 6 (design § 3): what was created, what failed and why, the invitations. A row fails here only
 * when something changed after the check — and when one did, the invitations were held back, so the
 * report offers them instead (design § 9).
 */
export const ReportStep: React.FC<Props> = ({ anImport, onStartAnother }) => {
  const t = useTranslations("peopleImport");
  const invite = useInvitePeopleImport();
  const [error, setError] = useState<string | null>(null);

  if (anImport.status === "FAILED") {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <p className="text-body font-medium text-primary">{t("report.stopped", { fileName: anImport.fileName })}</p>
        {anImport.errorDetail && <p className="text-body text-tertiary">{anImport.errorDetail}</p>}
        {anImport.kind !== "PEOPLE_CREATE" && <CheckErrors anImport={anImport} />}
        <p className="text-body text-tertiary">
          {anImport.kind === "PEOPLE_CREATE"
            ? t("report.stoppedPeople", { count: anImport.createdCount })
            : t("report.stoppedWhole")}
        </p>
        <div><Button type="button" onClick={onStartAnother}>{t("report.importAnother")}</Button></div>
      </div>
    );
  }

  const offerInvitations = anImport.canInvite && anImport.createdCount > 0 && anImport.invitedCount === 0;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="rounded-card border border-divider p-5">
        <p className="text-body font-medium text-primary">
          {t("report.imported", {
            noun: t(IMPORT_KINDS[anImport.kind].nounKey, { count: anImport.createdCount }),
            fileName: anImport.fileName,
          })}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-secondary">
          {anImport.failedCount > 0 && (
            <li>{t("report.failed", { count: anImport.failedCount })}</li>
          )}
          {anImport.unchangedCount > 0 && (
            <li>{t("report.unchanged", { count: anImport.unchangedCount })}</li>
          )}
          {anImport.invitedCount > 0 && <li>{t("report.invited", { count: anImport.invitedCount })}</li>}
          {anImport.inviteAfter && anImport.invitedCount === 0 && anImport.failedCount > 0 && (
            <li>{t("report.noInvitations")}</li>
          )}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {anImport.kind === "PEOPLE_CREATE" && (
            <Button asChild variant="secondary" size="sm">
              <Link href="/organization/people">{t("report.openPeople")}</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/admin/logs">{t("report.seeLogs")}</Link>
          </Button>
        </div>
      </div>

      <FormError message={error} />

      {offerInvitations && (
        <div>
          <Button type="button"
            variant="secondary"
            disabled={invite.isPending}
            onClick={() => {
              setError(null);
              invite.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) });
            }}
          >
            {invite.isPending
              ? t("report.sending")
              : t("report.inviteCreated", { count: anImport.createdCount })}
          </Button>
        </div>
      )}

      {anImport.status === "COMPLETED_WITH_FAILURES" && <CheckErrors anImport={anImport} />}

      <div><Button type="button" onClick={onStartAnother}>{t("report.importAnother")}</Button></div>
    </div>
  );
};
