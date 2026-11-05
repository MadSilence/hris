"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import * as React from "react";
import { FC, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar03Icon, Globe02Icon, LanguageSkillIcon, Location01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";

import { Label } from "@/components/desact/label";
import { Separator } from "@/components/desact/separator";
import { Skeleton } from "@/components/desact/skeleton";

import { CountryFlag } from "@/components/ui/CountryFlag";
import type { PublicHolidayTemplate } from "@/models/publicHolidays/template";
import { usePublicHolidayTemplates } from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayTemplates";
import {
  usePublicHolidayTemplateRegions
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayTemplateRegions";
import {
  PublicHolidayTemplatePicker,
  templateDisplayName,
} from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidayTemplatePicker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TagChip } from "@/components/ui/TagChip";

/** Radix Select cannot hold an empty value, so "no subdivision" needs a sentinel. */
const NATIONAL = "__national__";
const CURRENT_YEAR = new Date().getFullYear();

type Props = {
  isOpen: boolean;
  onRequestCloseAction: () => void;
};

export const ChoosePublicHolidayTemplateModal: FC<Props> = ({
  isOpen,
  onRequestCloseAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const {
    data: templates = [],
    isLoading,
    error,
  } = usePublicHolidayTemplates({ enabled: isOpen });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>(NATIONAL);

  const { data: regions = [], isFetching: isRegionsFetching } =
    usePublicHolidayTemplateRegions({
      templateId: selectedTemplateId,
      year: CURRENT_YEAR,
      enabled: Boolean(selectedTemplateId),
    });

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => template.id === selectedTemplateId) ?? null;
  }, [templates, selectedTemplateId]);

  const requestClose = () => {
    if (isLoading) return;

    setSelectedTemplateId("");
    setSelectedRegion(NATIONAL);
    onRequestCloseAction();
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    // Subdivisions belong to a country; keeping the old one would carry it across borders.
    setSelectedRegion(NATIONAL);
  };

  const handleGoToPreview = () => {
    if (!selectedTemplate) return;

    const region = selectedRegion !== NATIONAL
      ? `&region=${encodeURIComponent(selectedRegion)}`
      : "";

    router.push(`/settings/time/public-holidays/new?templateId=${selectedTemplate.id}${region}`);
  };

  // Below every hook on purpose: an early return above them would change how many hooks
  // this render calls. A failed read is still an answer, so it gets a region, not a crash.
  if (error) return <ErrorState error={error} compact />;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent hideClose className="overflow-hidden p-0 sm:max-w-2xl">
        <div className="px-8 pt-8">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.chooseTemplate.title")}</DialogTitle>
            <DialogDescription>
              {t("publicHolidays.chooseTemplate.description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-8 py-7">
          <div className="space-y-2">
            <p className="text-body font-medium text-primary">
              {t("publicHolidays.chooseTemplate.template")}
            </p>

            {isLoading ? (
              <Skeleton className="h-9 w-full"/>
            ) : (
              <PublicHolidayTemplatePicker
                templates={templates}
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                disabled={templates.length === 0}
              />
            )}

            {!isLoading && templates.length === 0 ? (
              <p className="text-hint text-tertiary">
                {t("publicHolidays.chooseTemplate.noTemplates")}
              </p>
            ) : null}
          </div>

          {/*
            * Only shown when the source actually has subdivisions. Google publishes country-level
            * calendars only, so its templates answer with an empty list and the field stays hidden.
            */}
          {selectedTemplate && (isRegionsFetching || regions.length > 0) ? (
            <div className="space-y-2">
              <Label htmlFor="template-region">{t("publicHolidays.chooseTemplate.region")}</Label>

              {isRegionsFetching ? (
                <Skeleton className="h-9 w-full"/>
              ) : (
                <SearchableSelect
                  id="template-region"
                  options={[
                    { value: NATIONAL, label: t("publicHolidays.chooseTemplate.nationalOnly") },
                    ...regions.map((region) => ({ value: region.code, label: `${region.name} (${region.code})` })),
                  ]}
                  value={selectedRegion || null}
                  onChange={(v) => setSelectedRegion(v ?? NATIONAL)}
                  clearable={false}
                />
              )}

              <p className="text-hint text-tertiary">
                {t("publicHolidays.chooseTemplate.regionHint")}
              </p>
            </div>
          ) : null}

          <TemplateSummary template={selectedTemplate}/>
        </div>

        <Separator/>

        <div className="px-8 py-5">
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={requestClose}
            >
              {tCommon("actions.cancel")}
            </Button>

            <Button
              type="button"
              disabled={isLoading || !selectedTemplate}
              onClick={handleGoToPreview}
            >
              {t("publicHolidays.chooseTemplate.useTemplate")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type TemplateSummaryProps = {
  template: PublicHolidayTemplate | null;
};

const TemplateSummary: FC<TemplateSummaryProps> = ({ template }) => {
  const t = useTranslations("timeOff");
  if (!template) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-card border border-dashed px-6 py-10 text-center">
        <Icon icon={Calendar03Icon} size="lg" className="mb-3 text-tertiary" />

        <p className="text-body font-medium">{t("publicHolidays.chooseTemplate.selectTemplate")}</p>

        <p className="mt-1 text-hint text-tertiary">
          {t("publicHolidays.chooseTemplate.detailsHere")}
        </p>
      </div>
    );
  }

  return (
    // No frame: the summary is the only thing in this half of the dialog, and a box around it just
    // draws a second border inside the dialog's own.
    <div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <CountryFlag countryCode={template.countryCode}/>

          <p className="text-body font-semibold text-primary">
            {templateDisplayName(template)}
          </p>

          {template.regional ? (
            // A kind, not a status: the tag palette (SPEC § 4.7).
            <TagChip color="plum">{t("publicHolidays.chooseTemplate.regional")}</TagChip>
          ) : (
            <TagChip color="ocean">{t("publicHolidays.chooseTemplate.national")}</TagChip>
          )}
        </div>

        {template.description ? (
          <p className="mt-2 text-body leading-6 text-tertiary">
            {template.description}
          </p>
        ) : null}
      </div>

      <Separator className="my-5"/>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryRow
          icon={<Icon icon={Globe02Icon} size="sm" />}
          label={t("publicHolidays.chooseTemplate.country")}
          value={`${template.countryName} (${template.countryCode})`}
        />

        <SummaryRow
          icon={<Icon icon={Location01Icon} size="sm" />}
          label={t("publicHolidays.chooseTemplate.region")}
          value={
            template.regionName && template.regionCode
              ? `${template.regionName} (${template.regionCode})`
              : t("publicHolidays.chooseTemplate.national")
          }
        />

        <SummaryRow
          icon={<Icon icon={LanguageSkillIcon} size="sm" />}
          label={t("publicHolidays.chooseTemplate.language")}
          value={template.languageCode.toUpperCase()}
        />

        <SummaryRow
          icon={<Icon icon={Calendar03Icon} size="sm" />}
          label={t("publicHolidays.chooseTemplate.supportedYears")}
          value={formatSupportedYears(template, t)}
        />
      </div>
    </div>
  );
};

type SummaryRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const SummaryRow: FC<SummaryRowProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-tertiary">{icon}</span>

      <div>
        <p className="text-hint text-tertiary">{label}</p>
        <p className="mt-0.5 text-body font-medium text-primary">
          {value}
        </p>
      </div>
    </div>
  );
};

function formatSupportedYears(
  template: PublicHolidayTemplate,
  t: ReturnType<typeof useTranslations<"timeOff">>,
) {
  const from = template.supportedYearFrom;
  const to = template.supportedYearTo;

  if (from && to) {
    return t("publicHolidays.chooseTemplate.yearsRange", { from, to });
  }

  if (from) {
    return t("publicHolidays.chooseTemplate.yearsFrom", { from });
  }

  if (to) {
    return t("publicHolidays.chooseTemplate.yearsUntil", { to });
  }

  return t("publicHolidays.chooseTemplate.anyYear");
}
