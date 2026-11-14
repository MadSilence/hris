"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, languageOf, type Language } from "@/i18n/locales";

import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { FieldError } from "@/components/desact/field-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CountryPicker } from "@/components/modules/firstRun/components/CountryPicker";
import {
  COMPANY_SETUP_QK,
  useCompanySetup,
  useSetupCountries,
} from "@/components/modules/firstRun/hooks";
import { submitCompanySetupAction } from "@/components/modules/firstRun/actions";
import { AuthBack, AuthFirstExperience } from "@/components/modules/auth/layout";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import type { CompanySetupDataset, CompanySizeBand } from "@/api/modules/firstRun/dto";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ChoiceCard, ProgressList, StepBars, StopsSlider } from "./FirstRunPieces";
import { setupStepKey, type SetupStepKey } from "./setupStep";

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

/** Each band with the example people it presets the slider to — the same numbers as `CompanySizeBand` in Java. */
const SIZE_BANDS = [
  { value: "UNDER_10", key: "under10", people: 8 },
  { value: "TEN_TO_50", key: "tenTo50", people: 25 },
  { value: "FIFTY_TO_200", key: "fiftyTo200", people: 60 },
  { value: "OVER_200", key: "over200", people: 150 },
] as const satisfies readonly { value: CompanySizeBand; key: string; people: number }[];

/** S2's slider: 8 · 25 · 60 · 150 example people. */
export const PEOPLE_STOPS: readonly number[] = SIZE_BANDS.map((band) => band.people);

const peopleForBand = (band: CompanySizeBand | null): number =>
  SIZE_BANDS.find((b) => b.value === band)?.people ?? PEOPLE_STOPS[0];

/** S3's list, in the order the runner works; the example company only when there is one. */
const PROGRESS: SetupStepKey[] = ["starting", "localization", "holidays", "exampleData", "finishing"];

type Errors = Partial<Record<"industry" | "size" | "country" | "dataset", string>>;

/**
 * The owner's first screen (first-run-setup S1–S5): their company in four answers, what to start with, and the wait.
 *
 * @param companyName read on the server by the page, not from the company provider: the heading says
 *                    it, and a provider that answers a moment later turns "your company" into "Acme" in
 *                    front of the reader.
 */
export const CompanySetupContainer: React.FC<{ companyName: string | null }> = ({ companyName }) => {
  const queryClient = useQueryClient();
  const t = useTranslations("firstRun");
  const tCommon = useTranslations("common");

  const [step, setStep] = React.useState(0);
  const [industry, setIndustry] = React.useState<string | null>(null);
  const [sizeBand, setSizeBand] = React.useState<CompanySizeBand | null>(null);
  const [countryCode, setCountryCode] = React.useState<string | null>(null);
  // Nothing chosen until the owner chooses (S2-1): which of the two is theirs is the question this step asks.
  const [dataset, setDataset] = React.useState<CompanySetupDataset | null>(null);
  const [people, setPeople] = React.useState<number>(PEOPLE_STOPS[0]);
  // The language this screen is already in — the browser's, on a company with no answer yet.
  const locale = useLocale();
  const [language, setLanguage] = React.useState<Language>(languageOf(locale));
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const countries = useSetupCountries();

  // The answer polls itself only while something is happening: the rest of the time this screen is a
  // form, and a form does not need a heartbeat.
  const [running, setRunning] = React.useState(false);
  const setup = useCompanySetup(running);

  const status = setup.data?.status;

  // Reopened mid-run — a reload, a closed tab, a second device (S5). The row remembers; the screen follows.
  React.useEffect(() => {
    if (status === "RUNNING") setRunning(true);
    // A failure stops the clock and brings back S2 with the alert (S4).
    if (status === "FAILED") {
      setRunning(false);
      setStep(1);
    }
  }, [status]);

  React.useEffect(() => {
    if (status !== "COMPLETED") return;
    setRunning(false);
    // The gate in the app layout reads this same row on the server, so the redirect has to be a real
    // navigation and not a client push — otherwise the layout is never re-evaluated. The welcome follows.
    window.location.assign("/dashboard");
  }, [status]);

  // Seeded answers are carried back into the form after a failure, so a retry does not retype them.
  React.useEffect(() => {
    if (!setup.data) return;
    setIndustry((current) => current ?? setup.data.industry);
    setSizeBand((current) => current ?? setup.data.sizeBand);
    setCountryCode((current) => current ?? setup.data.countryCode);
    if (setup.data.status === "FAILED") {
      setDataset((current) => current ?? setup.data.dataset);
      if (setup.data.dataset === "SAMPLE" && PEOPLE_STOPS.includes(setup.data.seededPeople)) {
        setPeople(setup.data.seededPeople);
      }
    }
  }, [setup.data]);

  if (setup.error) return <ErrorState error={setup.error} />;

  if (status === "RUNNING" || running) {
    return (
      <BuildingView
        step={setup.data?.step ?? null}
        stepCode={setup.data?.stepCode ?? null}
        dataset={setup.data?.dataset ?? dataset ?? "EMPTY"}
      />
    );
  }

  const next = () => {
    // Pressed with something unanswered, it says what (never disabled — first-run-setup § States, Error).
    const missing: Errors = {
      industry: industry ? undefined : t("setup.industry.required"),
      size: sizeBand ? undefined : t("setup.size.required"),
      country: countryCode ? undefined : t("setup.country.required"),
    };
    setErrors(missing);
    if (missing.industry || missing.size || missing.country) return;
    // The slider starts at the size given in S1; going back and changing the size moves it again.
    setPeople(peopleForBand(sizeBand));
    setStep(1);
  };

  const submit = async () => {
    if (!dataset) {
      setErrors({ dataset: t("setup.dataset.required") });
      return;
    }
    setSubmitting(true);
    const res = await submitCompanySetupAction({
      industry,
      sizeBand,
      countryCode,
      dataset,
      language,
      peopleCount: dataset === "SAMPLE" ? people : null,
    });
    setSubmitting(false);

    // Somebody else — the same owner in another window — started it first. That is not a failure to
    // report: the screen does what the refusal promises and follows their run.
    const alreadyRunning = res.status !== ActionStatus.SUCCESS && res.code === "CST0002";
    if (res.status !== ActionStatus.SUCCESS && !alreadyRunning) {
      showActionError(res);
      return;
    }
    setRunning(true);
    await queryClient.invalidateQueries({ queryKey: COMPANY_SETUP_QK });
  };

  const selectedCountry = countries.data?.find((c) => c.code === countryCode) ?? null;
  const failedAt = status === "FAILED" ? setupStepKey(setup.data?.step ?? null, setup.data?.stepCode) ?? "starting" : null;

  return (
    <AuthFirstExperience back={step > 0 ? <AuthBack onClick={() => setStep(0)} /> : undefined}>
      <div className="flex flex-col gap-4">
        <StepBars
          current={step + 1}
          total={2}
          name={step === 0 ? t("setup.steps.company") : t("setup.steps.dataset")}
        />
        <h1 className="text-auth-title text-primary [overflow-wrap:anywhere]">
          {step === 0
            ? companyName
              ? t.rich("setup.title", { company: companyName, em: (c) => <span className="text-accent-text">{c}</span> })
              : t("setup.titleNoName")
            : t("setup.dataset.title")}
        </h1>
        <p className="text-auth-lead text-secondary">{step === 0 ? t("setup.lead") : t("setup.dataset.lead")}</p>
      </div>

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-industry" className="text-label text-primary">{t("setup.industry.label")}</label>
            <SearchableSelect
              id="setup-industry"
              options={INDUSTRIES.map((option) => ({ value: option.value, label: t(`setup.industry.options.${option.key}`) }))}
              value={industry ?? null}
              onChange={(v) => {
                if (!v) return;
                setIndustry(v);
                setErrors((e) => ({ ...e, industry: undefined }));
              }}
              placeholder={t("setup.industry.placeholder")}
              clearable={false}
            />
            <FieldError>{errors.industry}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-size" className="text-label text-primary">{t("setup.size.label")}</label>
            <Select
              value={sizeBand ?? undefined}
              onValueChange={(v) => {
                setSizeBand(v as CompanySizeBand);
                setErrors((e) => ({ ...e, size: undefined }));
              }}
            >
              <SelectTrigger id="setup-size" className="w-full" aria-invalid={Boolean(errors.size) || undefined}>
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
            <FieldError>{errors.size}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-country" className="text-label text-primary">{t("setup.country.label")}</label>
            <CountryPicker
              id="setup-country"
              countries={countries.data ?? []}
              value={countryCode}
              onChange={(code) => {
                setCountryCode(code);
                setErrors((e) => ({ ...e, country: undefined }));
              }}
              disabled={countries.isLoading}
            />
            {errors.country ? (
              <FieldError>{errors.country}</FieldError>
            ) : (
              selectedCountry && (
                <p className="text-hint text-tertiary">
                  {t("setup.country.hintFor", {
                    timezone: selectedCountry.timezone,
                    weekday: selectedCountry.weekStartDay.toUpperCase(),
                    country: selectedCountry.name,
                  })}
                </p>
              )
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-language" className="text-label text-primary">{t("setup.language.label")}</label>
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

          {/* `type` and `key`: a `Button` defaults to submit, and React would reuse one node for both steps' buttons. */}
          <Button key="next" type="button" size="lg" className="w-full" onClick={next}>
            {tCommon("actions.continue")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {failedAt && <InlineAlert tone="declined">{t(`setup.failed.${failedAt}`)}</InlineAlert>}

          <div role="radiogroup" aria-label={t("setup.dataset.title")} className="flex flex-col gap-3">
            <ChoiceCard
              checked={dataset === "SAMPLE"}
              onSelect={() => {
                setDataset("SAMPLE");
                setErrors({});
              }}
              title={t("setup.datasets.sample.title")}
              body={t("setup.datasets.sample.body")}
            >
              <StopsSlider
                stops={PEOPLE_STOPS}
                value={people}
                onChange={setPeople}
                label={t("setup.datasets.sample.people")}
              />
            </ChoiceCard>
            <ChoiceCard
              checked={dataset === "EMPTY"}
              onSelect={() => {
                setDataset("EMPTY");
                setErrors({});
              }}
              title={t("setup.datasets.empty.title")}
              body={t("setup.datasets.empty.body")}
            />
            <FieldError>{errors.dataset}</FieldError>
          </div>

          <Button key="submit" type="button" size="lg" className="w-full" onClick={submit} loading={submitting}
                  loadingLabel={t("setup.submitting")}>
            {t("setup.submit")}
          </Button>
        </div>
      )}
    </AuthFirstExperience>
  );
};

/**
 * S3 — the wait, as a list: what is done, what is happening (the one nodding ring), what is ahead. A hundred and
 * fifty people plus a holiday calendar fetched from a third party take long enough that a bare spinner reads as a hang.
 */
const BuildingView: React.FC<{ step: string | null; stepCode: string | null; dataset: CompanySetupDataset }> = (
  { step, stepCode, dataset },
) => {
  const t = useTranslations("firstRun");
  const items = PROGRESS
    .filter((key) => key !== "exampleData" || dataset === "SAMPLE")
    .map((key) => ({ key, label: t(`setup.building.steps.${key}`) }));
  const known = setupStepKey(step, stepCode) ?? "starting";
  const current = Math.max(0, items.findIndex((item) => item.key === known));
  return (
    <AuthFirstExperience long={false}>
      <div className="flex flex-col gap-2">
        <h1 className="text-auth-title text-primary">{t("setup.building.title")}</h1>
        <p className="text-auth-lead text-secondary">{t("setup.building.lead")}</p>
      </div>
      <ProgressList items={items} current={current} />
    </AuthFirstExperience>
  );
};
