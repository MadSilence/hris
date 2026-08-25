"use client";

import * as React from "react";
import { FC, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Globe2, Languages, MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Label } from "@/public/desact/src/components/ui/label";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";

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
  const router = useRouter();

  const {
    data: templates = [],
    isLoading,
    error,
  } = usePublicHolidayTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>(NATIONAL);

  const { data: regions = [], isFetching: isRegionsFetching } =
    usePublicHolidayTemplateRegions({
      templateId: selectedTemplateId,
      year: CURRENT_YEAR,
      enabled: Boolean(selectedTemplateId),
    });

  if (error) throw error;

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
            <DialogTitle>Choose public holiday template</DialogTitle>
            <DialogDescription>
              Select a template to preview holidays before creating a company calendar.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-8 py-7">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Template
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
              <p className="text-xs text-[var(--color-text-tertiary)]">
                No public holiday templates are available yet.
              </p>
            ) : null}
          </div>

          {/*
            * Only shown when the source actually has subdivisions. Google publishes country-level
            * calendars only, so its templates answer with an empty list and the field stays hidden.
            */}
          {selectedTemplate && (isRegionsFetching || regions.length > 0) ? (
            <div className="space-y-2">
              <Label htmlFor="template-region">Region</Label>

              {isRegionsFetching ? (
                <Skeleton className="h-9 w-full"/>
              ) : (
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="template-region" className="w-full">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value={NATIONAL}>National holidays only</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.code} value={region.code}>
                        {region.name} ({region.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <p className="text-xs text-[var(--color-text-tertiary)]">
                A region adds the days that apply only there on top of the national ones.
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
              variant="outline"
              disabled={isLoading}
              onClick={requestClose}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={isLoading || !selectedTemplate}
              onClick={handleGoToPreview}
            >
              Use this template
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
  if (!template) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
        <CalendarDays className="mb-3 h-7 w-7 text-[var(--color-text-tertiary)]"/>

        <p className="text-sm font-medium">Select a template</p>

        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Template details will appear here.
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

          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {templateDisplayName(template)}
          </p>

          {template.regional ? (
            <Badge className="border-purple-200 bg-purple-100 text-purple-800">
              Regional
            </Badge>
          ) : (
            <Badge className="border-blue-200 bg-blue-100 text-blue-800">
              National
            </Badge>
          )}
        </div>

        {template.description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
            {template.description}
          </p>
        ) : null}
      </div>

      <Separator className="my-5"/>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryRow
          icon={<Globe2 className="size-4"/>}
          label="Country"
          value={`${template.countryName} (${template.countryCode})`}
        />

        <SummaryRow
          icon={<MapPin className="size-4"/>}
          label="Region"
          value={
            template.regionName && template.regionCode
              ? `${template.regionName} (${template.regionCode})`
              : "National"
          }
        />

        <SummaryRow
          icon={<Languages className="size-4"/>}
          label="Language"
          value={template.languageCode.toUpperCase()}
        />

        <SummaryRow
          icon={<CalendarDays className="size-4"/>}
          label="Supported years"
          value={formatSupportedYears(template)}
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
      <span className="mt-0.5 text-[var(--color-text-tertiary)]">{icon}</span>

      <div>
        <p className="text-xs text-[var(--color-text-tertiary)]">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
};

function formatSupportedYears(template: PublicHolidayTemplate) {
  const from = template.supportedYearFrom;
  const to = template.supportedYearTo;

  if (from && to) {
    return `${from} - ${to}`;
  }

  if (from) {
    return `From ${from}`;
  }

  if (to) {
    return `Until ${to}`;
  }

  return "Any supported year";
}
