"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { NodRing } from "@/components/desact/nod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { SearchBox } from "@/components/ui/SearchBox";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import type { AudienceResolved, HubAudience, HubAudienceMode } from "@/models/hub";
import { useAudienceResolve } from "../../hooks";
import { HubDialogClose, HubSegmented, PersonAvatar, useCompanyName } from "../../shared";
import { canApplyAudience, normalizeAudience, sameAudience } from "./audienceDraft";
import { HubPeopleField } from "./HubPeopleField";

/** "See who": the people the audience reaches, 360 wide, with search. */
const SeeWho: React.FC<{ audience: HubAudience }> = ({ audience }) => {
  const t = useTranslations("hub");
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const people = useAudienceResolve(audience, q, open);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="link" size="sm" className="text-hub-small font-medium text-accent">
          {t("audience.seeWho")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[360px] flex-col gap-2 p-2">
        <SearchBox fullWidth value={q} onChange={setQ} />
        <ul className="flex max-h-72 flex-col overflow-y-auto">
          {people.isLoading && (
            <li className="flex justify-center py-4">
              <NodRing />
            </li>
          )}
          {(people.data?.people ?? []).map((person) => (
            <li key={person.id} className="flex items-center gap-2 rounded-control px-2 py-1.5">
              <PersonAvatar person={person} size={28} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body text-primary">{person.name}</span>
                {person.jobTitle && <span className="truncate text-hint text-tertiary">{person.jobTitle}</span>}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

/** The summary under the choice: avatars, "{n} people", whether new people join, and See who (CM07). */
export const AudienceSummary: React.FC<{ audience: HubAudience; resolved: AudienceResolved | undefined; loading: boolean }> = ({
  audience,
  resolved,
  loading,
}) => {
  const t = useTranslations("hub");
  const company = useCompanyName();
  const total = resolved?.total ?? 0;
  return (
    // #F7F7F8, 50 high; avatars 26 with a 2 px white border, 18 apart; "{n} people" 13/18 500 (FIXES O7).
    <div className="flex min-h-[50px] items-center gap-3 rounded-tint bg-subtle px-3.5 py-2">
      {loading && !resolved ? (
        <NodRing size="sm" />
      ) : total === 0 ? (
        <span role="status" className="text-body text-secondary">
          {t("audience.noOne")}
        </span>
      ) : (
        <>
          <span className="flex -space-x-2">
            {(resolved?.people ?? []).slice(0, 3).map((p) => (
              <PersonAvatar key={p.id} person={p} size={26} className="ring-2 ring-card" />
            ))}
          </span>
          <span role="status" className="min-w-0 flex-1 text-body text-primary">
            {audience.mode === "EVERYONE" ? (
              <span className="text-label">{t("audience.everyoneCount", { company, count: total })}</span>
            ) : (
              <>
                <span className="text-label">{t("audience.people", { count: total })}</span>
                {audience.mode === "FILTER" && audience.filters.length > 0 && <span className="text-secondary">{t("audience.joinLater")}</span>}
              </>
            )}
          </span>
          <SeeWho audience={audience} />
        </>
      )}
    </div>
  );
};

/**
 * CM07, Who sees it: Everyone, Filter people (the People filter builder, plus "Also add" people and roles), or
 * Choose people. The live count comes from `/hub/audience/resolve`; Apply is hidden while it reaches nobody.
 * Closing with changes asks first.
 */
export const AudienceDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: "page" | "post" | "section";
  value: HubAudience;
  onApply: (audience: HubAudience, resolved: AudienceResolved | undefined) => void;
}> = ({ open, onOpenChange, subject, value, onApply }) => {
  const t = useTranslations("hub");
  const fields = useUserFields();
  const [draft, setDraft] = React.useState<HubAudience>(value);
  const [confirmClose, setConfirmClose] = React.useState(false);
  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const audience = normalizeAudience(draft.mode, draft);
  const resolved = useAudienceResolve(audience, "", open);
  const dirty = !sameAudience(audience, value);
  const applicable = canApplyAudience(resolved.data?.total, resolved.isFetching && !resolved.data);

  const close = () => (dirty ? setConfirmClose(true) : onOpenChange(false));

  const title = subject === "post" ? t("audience.titlePost") : subject === "section" ? t("audience.titleSection") : t("audience.titlePage");

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
        <DialogContent hideClose className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-[640px]">
          {/* 56 high, the title centred on the 32 close, the close secondary (FIXES O1). */}
          <DialogHeader className="flex-row items-center justify-between gap-4 py-3 pr-6 pl-6">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>
            <HubDialogClose onClick={close} />
          </DialogHeader>
          {/* 22 between the parts, padding 16 24 0, 22 to the footer's hairline (O2). */}
          <div className="flex flex-1 flex-col gap-5.5 overflow-y-auto px-6 pt-4 pb-5.5">
            <HubSegmented<HubAudienceMode>
              aria-label={title}
              value={draft.mode}
              onChange={(mode) => setDraft((d) => ({ ...d, mode }))}
              options={[
                { value: "EVERYONE", label: t("audience.everyone") },
                { value: "FILTER", label: t("audience.filterPeople") },
                { value: "PEOPLE", label: t("audience.choosePeople") },
              ]}
            />
            {draft.mode === "FILTER" && (
              <div className="flex flex-col gap-2.5">
                <p className="text-label text-primary">{t("audience.matchAll")}</p>
                <AudienceBuilder
                  fields={fields.data}
                  isLoadingFields={fields.isLoading}
                  value={draft.filters}
                  onChange={(filters) => setDraft((d) => ({ ...d, filters }))}
                />
                {/* "Also add" 13/18 500 Ink + " (optional)" 400 tertiary; the field 42, padding 6 8 (O6). */}
                <label className="mt-3 text-label text-primary" htmlFor="hub-also-add">
                  {t("audience.alsoAdd")}
                  {" "}<span className="font-normal text-tertiary">{t("audience.optional")}</span>
                </label>
                <div className="[&>div]:min-h-[42px] [&>div]:px-2 [&>div]:py-1.5">
                  <HubPeopleField
                    id="hub-also-add"
                    ariaLabel={t("audience.searchPeopleRoles")}
                    placeholder={t("audience.searchPeopleRoles")}
                    value={draft}
                    onChange={(people) => setDraft((d) => ({ ...d, ...people }))}
                  />
                </div>
              </div>
            )}
            {draft.mode === "PEOPLE" && (
              <HubPeopleField
                ariaLabel={t("audience.searchPeopleRoles")}
                placeholder={t("audience.searchPeopleRoles")}
                value={draft}
                onChange={(people) => setDraft((d) => ({ ...d, ...people }))}
              />
            )}
            <AudienceSummary audience={audience} resolved={resolved.data} loading={resolved.isFetching} />
          </div>
          <DialogFooter className="border-t border-divider px-6 py-4">
            <Button type="button" variant="secondary" onClick={close}>
              {t("actions.cancel")}
            </Button>
            {/* Nothing is shown disabled: while the audience reaches nobody (the summary says so), there is no Apply. */}
            {applicable && (
              <Button
                type="button"
                onClick={() => {
                  onApply(audience, resolved.data);
                  onOpenChange(false);
                }}
              >
                {t("actions.apply")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmCancelModal
        isOpen={confirmClose}
        title={t("audience.discardTitle")}
        description={t("audience.discardLine")}
        cancelText={t("actions.keepEditing")}
        confirmText={t("actions.discard")}
        onCancelAction={() => setConfirmClose(false)}
        onConfirmAction={() => {
          setConfirmClose(false);
          onOpenChange(false);
        }}
      />
    </>
  );
};

