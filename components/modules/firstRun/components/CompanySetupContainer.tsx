"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
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

/**
 * The list the owner picks from. Free text on the wire, so this can grow without a migration — which
 * it will, because it is the seed of the industry templates this answer is really being stored for.
 */
const INDUSTRIES = [
  "Software & IT",
  "Professional services",
  "Finance & insurance",
  "Healthcare",
  "Manufacturing",
  "Retail & e-commerce",
  "Education",
  "Hospitality",
  "Construction",
  "Transport & logistics",
  "Public sector",
  "Non-profit",
  "Other",
];

const SIZE_BANDS: { value: CompanySizeBand; label: string }[] = [
  { value: "UNDER_10", label: "Fewer than 10" },
  { value: "TEN_TO_50", label: "10 to 50" },
  { value: "FIFTY_TO_200", label: "50 to 200" },
  { value: "OVER_200", label: "More than 200" },
];

const DATASETS: { value: CompanySetupDataset; title: string; body: string }[] = [
  {
    value: "SAMPLE",
    title: "Example company",
    body:
      "Offices, departments, job titles, leave policies and a set of people sized to your answer — " +
      "enough to see how every screen looks before you put anything real in.",
  },
  {
    value: "EMPTY",
    title: "Start empty",
    body:
      "Nothing but your own account. Everything is here — the fields, the roles, the leave types — " +
      "and none of it is filled in with anybody imaginary.",
  },
  {
    value: "DEFAULT",
    title: "Full demo",
    body:
      "The complete demo company: fifty people whatever your size, with every feature exercised. " +
      "The most to look at, and the most to clear out afterwards.",
  },
];

const STEPS = ["Your company", "What to start with"] as const;

/**
 * @param companyName read on the server by the page, not from the company provider: the heading says
 *                    it, and a provider that answers a moment later turns "Welcome to your company"
 *                    into "Welcome to Acme" in front of the reader.
 */
export const CompanySetupContainer: React.FC<{ companyName: string | null }> = ({ companyName }) => {
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState(0);
  const [industry, setIndustry] = React.useState<string | null>(null);
  const [sizeBand, setSizeBand] = React.useState<CompanySizeBand | null>(null);
  const [countryCode, setCountryCode] = React.useState<string | null>(null);
  const [dataset, setDataset] = React.useState<CompanySetupDataset>("SAMPLE");
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
    return <BuildingView step={setup.data?.step ?? null} dataset={setup.data?.dataset ?? dataset} />;
  }

  const submit = async () => {
    setSubmitting(true);
    const res = await submitCompanySetupAction({ industry, sizeBand, countryCode, dataset });
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
        <Stepper steps={STEPS} current={step} />
        <h1 className="text-page-title text-primary">
          {step === 0
            ? companyName
              ? `Welcome to ${companyName}`
              : "Welcome"
            : "What should we start you with?"}
        </h1>
        <p className="text-body text-secondary">
          {step === 0
            ? "Three questions, so the product arrives set up rather than blank. You can change any of it later."
            : "Whichever you pick, every feature is switched on. This is only about what is in it on day one."}
        </p>
      </header>

      {setup.data?.status === "FAILED" && setup.data.errorDetail && (
        <Banner icon={Alert02Icon}>
          The last attempt stopped: {setup.data.errorDetail}. Your answers are still here — try again.
        </Banner>
      )}

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-industry">What does the company do?</RequiredLabel>
            <SearchableSelect
              id="setup-industry"
              options={INDUSTRIES.map((name) => ({ value: name, label: name }))}
              value={industry ?? null}
              onChange={(v) => v && setIndustry(v)}
              placeholder="Select an industry"
              clearable={false}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-size">How many people will use it?</RequiredLabel>
            <Select
              value={sizeBand ?? undefined}
              onValueChange={(v) => setSizeBand(v as CompanySizeBand)}
            >
              <SelectTrigger id="setup-size" className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_BANDS.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-country">Where is the company based?</RequiredLabel>
            <CountryPicker
              id="setup-country"
              countries={countries.data ?? []}
              value={countryCode}
              onChange={setCountryCode}
              disabled={countries.isLoading}
            />
            <p className="text-hint text-tertiary">
              {selectedCountry
                ? `Sets your time zone to ${selectedCountry.timezone}, starts the week on ` +
                  `${selectedCountry.weekStartDay.toLowerCase()}, and builds that country's public holiday calendar.`
                : "Sets your time zone and working week, and builds that country's public holiday calendar."}
            </p>
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
                <span className="font-medium text-primary">{option.title}</span>
                <span className="text-body text-tertiary">{option.body}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep(0)} disabled={submitting}>
            Back
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
          <Button key="next" type="button" onClick={() => setStep(1)}>Continue</Button>
        ) : (
          <Button key="submit" type="button" onClick={submit} loading={submitting}>
            {submitting ? "Setting up…" : "Set up my company"}
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
const BuildingView: React.FC<{ step: string | null; dataset: CompanySetupDataset }> = ({ step, dataset }) => (
  <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 bg-card px-4 text-center">
    <NoddoWordmark height={32} className="mb-4" />
    <Illustration scene={dataset === "EMPTY" ? "company-hub" : "team-and-org"} />
    <h1 className="text-page-title text-primary">Setting up your company</h1>
    <p className="flex items-center gap-2 text-body text-secondary">
      <NodRing size="sm" label="" />
      {step ?? "Getting started"}
    </p>
    <p className="text-body text-tertiary">
      This takes a few moments. You can leave this page — it will pick up where it left off.
    </p>
  </div>
);
