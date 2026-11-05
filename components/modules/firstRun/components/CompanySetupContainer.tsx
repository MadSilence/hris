"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, languageOf, type Language } from "@/i18n/locales";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { NodRing } from "@/components/desact/nod";

import { Button } from "@/components/desact/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CountryPicker } from "@/components/modules/firstRun/components/CountryPicker";
import {
  COMPANY_SETUP_QK,
  useCompanySetup,
  useSetupCountries,
} from "@/components/modules/firstRun/hooks";
import { submitCompanySetupAction } from "@/components/modules/firstRun/actions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import type { CompanySetupDataset, CompanySizeBand } from "@/api/modules/firstRun/dto";
import { cn } from "@/lib/cn";
import { Stepper } from "@/components/ui/Stepper";
import { NoddoWordmark } from "@/components/brand";
import { Illustration } from "@/components/illustrations/Illustration";
import { Banner } from "@/components/desact/alert";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { setupStepKey } from "./setupStep";

/**
 * The list the owner picks from. Free text on the wire, so this can grow without a migration — which
 * it will, because it is the seed of the industry templates this answer is really being stored for.
 *
 * `value` is what is stored, and stays English whatever the reader's language: it is a code the industry
 * templates will be matched on, not a word on the screen. `key` is the label in the `firstRun` catalogue.
 */
const INDUSTRIES = [
  { value: "Software & IT", key: "software" },
  { value: "Professional services", key: "professionalServices" },
  { value: "Finance & insurance", key: "finance" },
  { value: "Healthcare", key: "healthcare" },
  { value: "Manufacturing", key: "manufacturing" },
  { value: "Retail & e-commerce", key: "retail" },
  { value: "Education", key: "education" },
  { value: "Hospitality", key: "hospitality" },
  { value: "Construction", key: "construction" },
  { value: "Transport & logistics", key: "transport" },
  { value: "Public sector", key: "publicSector" },
  { value: "Non-profit", key: "nonProfit" },
  { value: "Other", key: "other" },
] as const;

const SIZE_BANDS = [
  { value: "UNDER_10", key: "under10" },
  { value: "TEN_TO_50", key: "tenTo50" },
  { value: "FIFTY_TO_200", key: "fiftyTo200" },
  { value: "OVER_200", key: "over200" },
] as const satisfies readonly { value: CompanySizeBand; key: string }[];

const DATASETS = [
  { value: "SAMPLE", key: "sample" },
  { value: "EMPTY", key: "empty" },
  { value: "DEFAULT", key: "full" },
] as const satisfies readonly { value: CompanySetupDataset; key: string }[];

/**
 * @param companyName read on the server by the page, not from the company provider: the heading says
 *                    it, and a provider that answers a moment later turns "Welcome to your company"
 *                    into "Welcome to Acme" in front of the reader.
 */
export const CompanySetupContainer: React.FC<{ companyName: string | null }> = ({ companyName }) => {
  const queryClient = useQueryClient();
  const t = useTranslations("firstRun");
  const tCommon = useTranslations("common");
  const steps = React.useMemo(() => [t("setup.steps.company"), t("setup.steps.dataset")], [t]);

  const [step, setStep] = React.useState(0);
  const [industry, setIndustry] = React.useState<string | null>(null);
  const [sizeBand, setSizeBand] = React.useState<CompanySizeBand | null>(null);
  const [countryCode, setCountryCode] = React.useState<string | null>(null);
  const [dataset, setDataset] = React.useState<CompanySetupDataset>("SAMPLE");
  // The language this screen is already in — the browser's, on a company with no answer yet.
  const locale = useLocale();
  const [language, setLanguage] = React.useState<Language>(languageOf(locale));
  const [submitting, setSubmitting] = React.useState(false);

  const countries = useSetupCountries();

  // The answer polls itself only while something is happening: the rest of the time this screen is a
  // form, and a form does not need a heartbeat.
  const [running, setRunning] = React.useState(false);
  const setup = useCompanySetup(running);

  const status = setup.data?.status;

  // Reopened mid-run — a reload, a closed tab, a second device. The row remembers; the screen follows.
  React.useEffect(() => {
    if (status === "RUNNING") setRunning(true);
  }, [status]);

  React.useEffect(() => {
    if (status !== "COMPLETED") return;
    setRunning(false);
    // The gate in the app layout reads this same row on the server, so the redirect has to be a real
    // navigation and not a client push — otherwise the layout is never re-evaluated.
    window.location.assign("/dashboard");
  }, [status]);

  // Seeded answers are carried back into the form after a failure, so a retry does not retype them.
  React.useEffect(() => {
    if (!setup.data) return;
    setIndustry((current) => current ?? setup.data.industry);
    setSizeBand((current) => current ?? setup.data.sizeBand);
    setCountryCode((current) => current ?? setup.data.countryCode);
  }, [setup.data]);

  if (setup.error) return <ErrorState error={setup.error} />;

  if (status === "RUNNING" || running) {
    return <BuildingView step={setup.data?.step ?? null} stepCode={setup.data?.stepCode ?? null}
      dataset={setup.data?.dataset ?? dataset} />;
  }

  const submit = async () => {
    setSubmitting(true);
    const res = await submitCompanySetupAction({ industry, sizeBand, countryCode, dataset, language });
    setSubmitting(false);

    // Somebody else — the same owner in another window — started it first. That is not a failure to
    // report: the screen does what the refusal promises and follows their run. It used to raise the
    // refusal card, with a request id nobody needs, and leave this window on the form.
    const alreadyRunning = res.status !== ActionStatus.SUCCESS && res.code === "CST0002";
    if (res.status !== ActionStatus.SUCCESS && !alreadyRunning) {
      showActionError(res);
      return;
    }
    setRunning(true);
    await queryClient.invalidateQueries({ queryKey: COMPANY_SETUP_QK });
  };

  const selectedCountry = countries.data?.find((c) => c.code === countryCode) ?? null;

  return (
    // noddo's own screen (SPEC § 2): the company has a name and nothing else yet, so the wordmark heads it.
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <NoddoWordmark height={24} />
      <div className="flex flex-1 flex-col justify-center gap-8">
      <header className="flex flex-col gap-4">
        <Stepper steps={steps} current={step} />
        <h1 className="text-page-title text-primary">
          {step === 0
            ? companyName
              ? t("setup.welcomeTo", { company: companyName })
              : t("setup.welcome")
            : t("setup.datasetTitle")}
        </h1>
        <p className="text-body text-secondary">
          {step === 0 ? t("setup.companyLead") : t("setup.datasetLead")}
        </p>
      </header>

      {setup.data?.status === "FAILED" && setup.data.errorDetail && (
        <Banner icon={Alert02Icon}>
          {t("setup.failed", { detail: setup.data.errorDetail })}
        </Banner>
      )}

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-industry">{t("setup.industry.label")}</RequiredLabel>
            <SearchableSelect
              id="setup-industry"
              options={INDUSTRIES.map((option) => ({ value: option.value, label: t(`setup.industry.options.${option.key}`) }))}
              value={industry ?? null}
              onChange={(v) => v && setIndustry(v)}
              placeholder={t("setup.industry.placeholder")}
              clearable={false}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-size">{t("setup.size.label")}</RequiredLabel>
            <Select
              value={sizeBand ?? undefined}
              onValueChange={(v) => setSizeBand(v as CompanySizeBand)}
            >
              <SelectTrigger id="setup-size" className="w-full">
                <SelectValue placeholder={t("setup.size.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {SIZE_BANDS.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {t(`setup.size.options.${band.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-country">{t("setup.country.label")}</RequiredLabel>
            <CountryPicker
              id="setup-country"
              countries={countries.data ?? []}
              value={countryCode}
              onChange={setCountryCode}
              disabled={countries.isLoading}
            />
            <p className="text-hint text-tertiary">
              {selectedCountry
                ? t("setup.country.hintFor", {
                    timezone: selectedCountry.timezone,
                    weekday: selectedCountry.weekStartDay.toUpperCase(),
                  })
                : t("setup.country.hint")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-language">{t("setup.language.label")}</RequiredLabel>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger id="setup-language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {tCommon(`language.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-hint text-tertiary">{t("setup.language.hint")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {DATASETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDataset(option.value)}
              aria-pressed={dataset === option.value}
              className={cn(
                "flex w-full items-start gap-3 rounded-card border bg-card px-4 py-3 text-left transition-colors",
                dataset === option.value
                  ? "border-accent bg-accent-subtle"
                  : "border-divider hover:bg-row-hover",
              )}
            >
              {/* A radio's look (SPEC § 13.12): a 16 px circle, an accent dot when chosen. */}
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-pill border-[1.5px] bg-card",
                  dataset === option.value ? "border-accent" : "border-strong",
                )}
              >
                {dataset === option.value && <span className="h-2 w-2 rounded-pill bg-accent" />}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-medium text-primary">{t(`setup.datasets.${option.key}.title`)}</span>
                <span className="text-body text-tertiary">{t(`setup.datasets.${option.key}.body`)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep(0)} disabled={submitting}>
            {tCommon("actions.back")}
          </Button>
        ) : (
          <span />
        )}

        {step === 0 ? (
          // Every question is skippable, and Next is the only button: the answers shape what gets
          // built, they do not gate the product. A wizard that will not let somebody past an
          // unanswered "what does your company do" is a toll gate.
          // `type` and `key` for the same reason as the welcome's footer — a `Button` defaults to
          // submit, and React reuses one DOM node for both branches of this ternary.
          <Button key="next" type="button" onClick={() => setStep(1)}>{tCommon("actions.continue")}</Button>
        ) : (
          <Button key="submit" type="button" onClick={submit} loading={submitting}>
            {submitting ? t("setup.submitting") : t("setup.submit")}
          </Button>
        )}
      </div>
      </div>
    </div>
  );
};

/**
 * What the wait looks like.
 *
 * <p>The step is named, not spun at: a hundred and fifty people plus a holiday calendar fetched from
 * a third party takes long enough that a bare spinner reads as a hang. Splash B of SPEC § 3 — white, the
 * Ink wordmark, the ring — the first load of a new workspace.
 */
const BuildingView: React.FC<{ step: string | null; stepCode: string | null; dataset: CompanySetupDataset }> = (
  { step, stepCode, dataset },
) => {
  const t = useTranslations("firstRun");
  const known = setupStepKey(step, stepCode);
  return (
  <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 bg-card px-4 text-center">
    <NoddoWordmark height={32} className="mb-4" />
    <Illustration scene={dataset === "EMPTY" ? "company-hub" : "team-and-org"} />
    <h1 className="text-page-title text-primary">{t("setup.building.title")}</h1>
    <p className="flex items-center gap-2 text-body text-secondary">
      <NodRing size="sm" label="" />
      {known ? t(`setup.building.steps.${known}`) : step}
    </p>
    <p className="text-body text-tertiary">
      {t("setup.building.lead")}
    </p>
  </div>
  );
};
