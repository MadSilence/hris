"use client";

import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { buildAudienceFields, type AudienceField } from "@/components/audience/fieldCatalog";
import { useFilterValueLabel } from "@/components/audience/hooks/useFilterValueLabel";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { useShortDates } from "@/lib/date";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { BoardScale } from "@/components/modules/calendar/lib/boardGeometry";

type Props = {
  /** The link: this page's address with the state on screen. */
  href: () => string;
  /** The picked view's name, when a view is picked. */
  viewName: string | null;
  fields: FieldDTO[] | undefined;
  filters: FilterDTO[];
  personField: AudienceField;
  person: string | null;
  scale: BoardScale;
  /** The first day on screen. */
  from: string;
};

const chip = "inline-flex h-8 items-center gap-1.5 rounded-pill border border-field bg-card px-3 text-label font-normal text-tertiary";

/**
 * Share (N10c, N10d): a small window, "Share this view" — what the link keeps (the view's pill, the filter chips,
 * "Month · from 12 Nov"), "People see only what they have access to.", and **Copy link**. After copying, the toast
 * "Link copied". The link carries no right: the receiver's own access decides what it shows them.
 */
export const CompanyCalendarShare: FC<Props> = ({ href, viewName, fields, filters, personField, person, scale, from }) => {
  const t = useTranslations("calendar");
  const shortDates = useShortDates();
  const { access } = useAccess();
  const [open, setOpen] = useState(false);
  const catalog = useMemo(
    () => buildAudienceFields(fields, (resource) => canAccess({ access, resource, action: "VIEW" })),
    [fields, access],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(href(), window.location.origin).toString());
      setOpen(false);
      showSuccess(t("share.copied"));
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary">
          <Icon icon={Link01Icon} size="sm" />
          {t("share.button")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-90 flex-col gap-3 rounded-card p-4">
        <p className="font-heading text-card-title text-primary">{t("share.title")}</p>
        <p className="text-body text-secondary">{t("share.keeps")}</p>
        <div className="flex flex-wrap gap-1.5">
          {viewName ? (
            <span className="inline-flex h-8 items-center rounded-pill bg-accent-subtle px-3 text-label font-semibold text-accent-text">
              {viewName}
            </span>
          ) : null}
          {filters.map((filter, i) => (
            <ShareChip
              key={`${filter.field}-${i}`}
              filter={filter}
              field={catalog.find((f) => f.key === filter.field) ?? null}
              dto={fields?.find((f) => f.id === filter.field) ?? null}
            />
          ))}
          {person ? <ShareChip filter={{ field: "person", op: "eq", value: person }} field={personField} dto={null} /> : null}
          <span className={chip}>
            {t.rich("share.period", {
              scale,
              date: shortDates.date(from, { hideYear: true }),
              b: (text) => <b className="font-medium text-primary">{text}</b>,
            })}
          </span>
        </div>
        <p className="text-label font-normal text-tertiary">{t("share.access")}</p>
        <div>
          <Button type="button" size="sm" onClick={() => void copy()}>
            <Icon icon={Copy01Icon} size="sm" />
            {t("share.copy")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** A condition as the link keeps it: "Team **Design**", read only. */
const ShareChip: FC<{ filter: FilterDTO; field: AudienceField | null; dto: FieldDTO | null }> = ({ filter, field, dto }) => {
  const tAccess = useTranslations("access");
  const value = useFilterValueLabel(field, dto, filter);
  const plainIs = filter.op === "eq" || filter.op === "in";
  return (
    <span className={chip}>
      {field?.label ?? filter.field}
      {plainIs ? null : ` ${tAccess(`audience.operatorWords.${filter.op}`)}`}
      <b className="max-w-40 truncate font-medium text-primary">{value}</b>
    </span>
  );
};
