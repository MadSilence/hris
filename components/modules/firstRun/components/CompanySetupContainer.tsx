"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Building2, Check, Loader2, Users } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
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
import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * The list the owner picks from. Free text on the wire, so this can grow without a migration — which
 * it will, because it is the seed of the industry templates this answer is really being stored for.
 */
const INDUSTRIES = [
  "Software & IT",
  "Professional Services",
  "Finance & Insurance",
  "Healthcare",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Hospitality",
  "Construction",
  "Transport & Logistics",
  "Public Sector",
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
    title: "Example Company",
    body:
      "Offices, departments, job titles, leave policies and a set of people sized to your answer — " +
      "enough to see how every screen looks before you put anything real in.",
  },
  {
    value: "EMPTY",
    title: "Start Empty",
    body:
      "Nothing but your own account. Everything is here — the fields, the roles, the leave types — " +
      "and none of it is filled in with anybody imaginary.",
  },
  {
    value: "DEFAULT",
    title: "Full Demo",
    body:
      "The complete demo company: fifty people whatever your size, with every feature exercised. " +
      "The most to look at, and the most to clear out afterwards.",
  },
];

const STEPS = ["Your Company", "What to Start With"] as const;

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

    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    setRunning(true);
    await queryClient.invalidateQueries({ queryKey: COMPANY_SETUP_QK });
  };

  const selectedCountry = countries.data?.find((c) => c.code === countryCode) ?? null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          {step === 0
            ? companyName
              ? `Welcome to ${companyName}`
              : "Welcome"
            : "What should we start you with?"}
        </h1>
        <p className="text-muted-foreground">
          {step === 0
            ? "Three questions, so the product arrives set up rather than blank. You can change any of it later."
            : "Whichever you pick, every feature is switched on. This is only about what is in it on day one."}
        </p>
      </header>

      {setup.data?.status === "FAILED" && setup.data.errorDetail && (
        <div className="flex items-start gap-2 rounded-md border border-brown-200 bg-brown-50 px-4 py-3 text-sm text-brown-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <span>
            The last attempt stopped: {setup.data.errorDetail}. Your answers are still here — try again.
          </span>
        </div>
      )}

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor="setup-industry">What does the company do?</RequiredLabel>
            <Select value={industry ?? undefined} onValueChange={setIndustry}>
              <SelectTrigger id="setup-industry" className="w-full">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <p className="text-xs text-muted-foreground">
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
                "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                dataset === option.value
                  ? "border-foreground bg-brown-50"
                  : "border-brown-200 hover:bg-brown-50/60",
              )}
            >
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-brown-300 bg-background">
                {dataset === option.value && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{option.title}</span>
                <span className="text-sm text-muted-foreground">{option.body}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep(0)} disabled={submitting}>
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
          <Button key="next" type="button" onClick={() => setStep(1)}>Next</Button>
        ) : (
          <Button key="submit" type="button" onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Set Up My Company
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * What the wait looks like.
 *
 * <p>The step is named, not spun at: a hundred and fifty people plus a holiday calendar fetched from
 * a third party takes long enough that a bare spinner reads as a hang.
 */
const BuildingView: React.FC<{ step: string | null; dataset: CompanySetupDataset }> = ({ step, dataset }) => (
  <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50">
      {dataset === "EMPTY" ? (
        <Building2 className="h-6 w-6 text-brown-700" />
      ) : (
        <Users className="h-6 w-6 text-brown-700" />
      )}
    </div>
    <h1 className="text-2xl font-semibold text-foreground">Setting up your company</h1>
    <p className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {step ?? "Getting started"}
    </p>
    <p className="text-sm text-muted-foreground">
      This takes a few moments. You can leave this page — it will pick up where it left off.
    </p>
  </div>
);
