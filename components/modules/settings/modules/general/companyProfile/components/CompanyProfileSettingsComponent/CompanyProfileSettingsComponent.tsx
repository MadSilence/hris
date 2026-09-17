"use client";

import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { Building2, Clock, Globe } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { cn } from "@/public/desact/src/components/ui/utils";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import type { Company } from "@/models/company/Company";
import type { CompanySettings } from "@/models/company/CompanySettings";
import type { UpdateCompanyRequest, UpdateCompanySettingsRequest } from "@/api/modules/company/dto/CompanyDTO";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { companyHost, companyOrigin } from "@/lib/companyAddress";

type Saved = { version?: number } | undefined;

type Props = {
  company: Company;
  settings: CompanySettings;
  /** Resolves with what was saved, when the caller has it, so the form holds the version it produced. */
  onSaveProfile: (body: UpdateCompanyRequest) => Promise<Saved | void> | void;
  onSaveSettings: (body: UpdateCompanySettingsRequest) => Promise<Saved | void> | void;
  savingProfile: boolean;
  savingSettings: boolean;
  profileError: string | null;
  settingsError: string | null;
};

const DAYS: { value: string; label: string }[] = [
  { value: "MONDAY", label: "Mon" },
  { value: "TUESDAY", label: "Tue" },
  { value: "WEDNESDAY", label: "Wed" },
  { value: "THURSDAY", label: "Thu" },
  { value: "FRIDAY", label: "Fri" },
  { value: "SATURDAY", label: "Sat" },
  { value: "SUNDAY", label: "Sun" },
];

/**
 * A curated list instead of the ~400 zones `Intl.supportedValuesOf("timeZone")` returns — nobody
 * scrolls to "America/Argentina/Catamarca", and a company clock only needs one zone per offset.
 *
 * The stored value stays IANA, not an abbreviation: only IANA knows when a zone changes offset, so
 * "Europe/Berlin" survives daylight saving where a literal "CET" would silently be an hour off for
 * half the year. The label carries the abbreviation people actually recognise.
 */
const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "Pacific/Honolulu", label: "HST — Honolulu (UTC−10)" },
  { value: "America/Anchorage", label: "AKT — Anchorage (UTC−9)" },
  { value: "America/Los_Angeles", label: "PT — Los Angeles, Vancouver (UTC−8)" },
  { value: "America/Denver", label: "MT — Denver, Calgary (UTC−7)" },
  { value: "America/Chicago", label: "CT — Chicago, Mexico City (UTC−6)" },
  { value: "America/New_York", label: "ET — New York, Toronto (UTC−5)" },
  { value: "America/Sao_Paulo", label: "BRT — São Paulo (UTC−3)" },
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "Europe/London", label: "GMT/BST — London, Dublin, Lisbon (UTC+0)" },
  { value: "Africa/Lagos", label: "WAT — Lagos (UTC+1)" },
  { value: "Europe/Berlin", label: "CET/CEST — Berlin, Paris, Madrid, Warsaw (UTC+1)" },
  { value: "Africa/Johannesburg", label: "SAST — Johannesburg (UTC+2)" },
  { value: "Europe/Athens", label: "EET/EEST — Athens, Helsinki, Kyiv (UTC+2)" },
  { value: "Europe/Moscow", label: "MSK — Moscow, Istanbul (UTC+3)" },
  { value: "Asia/Dubai", label: "GST — Dubai (UTC+4)" },
  { value: "Asia/Karachi", label: "PKT — Karachi, Tashkent (UTC+5)" },
  { value: "Asia/Kolkata", label: "IST — Delhi, Mumbai, Bengaluru (UTC+5:30)" },
  { value: "Asia/Almaty", label: "ALMT — Almaty, Dhaka (UTC+6)" },
  { value: "Asia/Bangkok", label: "ICT — Bangkok, Jakarta, Hanoi (UTC+7)" },
  { value: "Asia/Shanghai", label: "CST — Shanghai, Beijing (UTC+8)" },
  { value: "Asia/Singapore", label: "SGT — Singapore, Kuala Lumpur (UTC+8)" },
  { value: "Asia/Tokyo", label: "JST — Tokyo (UTC+9)" },
  { value: "Asia/Seoul", label: "KST — Seoul (UTC+9)" },
  { value: "Australia/Sydney", label: "AEST/AEDT — Sydney, Melbourne (UTC+10)" },
  { value: "Pacific/Auckland", label: "NZST/NZDT — Auckland (UTC+12)" },
];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const titleCase = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

const Section: FC<{
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}> = ({ icon, title, description, children }) => (
  <section className="flex flex-col gap-5">
    <div>
      <h2 className="m-0 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </h2>

      <p className="m-0 mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>

    {children}
  </section>
);

const Field: FC<{ id: string; label: string; className?: string; children: ReactNode }> = ({
  id,
  label,
  className,
  children,
}) => (
  <div className={cn("grid gap-2", className)}>
    <Label htmlFor={id} className="mb-0">
      {label}
    </Label>

    {children}
  </div>
);

/**
 * Where the company's people sign in. Shown as text rather than as a disabled input that looks editable
 * and is not: an administrator's job with it is to read it out and
 * hand it on, so it can be copied.
 */
const SignInAddress: FC<{ subdomain: string }> = ({ subdomain }) => {
  const web = useAppDataContext().envConfig?.web;
  const address = web ? companyHost(subdomain, web) : subdomain;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(web ? `${companyOrigin(subdomain, web)}/login` : address);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label className="mb-0">Sign-in Address</Label>

      <div className="flex h-9 min-w-0 items-center justify-between gap-2">
        <span data-test="company-sign-in-address" className="truncate text-sm text-foreground">{address}</span>

        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
};

export const CompanyProfileSettingsComponent: FC<Props> = ({
  company,
  settings,
  onSaveProfile,
  onSaveSettings,
  savingProfile,
  savingSettings,
  profileError,
  settingsError,
}) => {
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description ?? "");
  const [website, setWebsite] = useState(company.website ?? "");

  const [timezone, setTimezone] = useState(settings.timezone);

  // A company already on a zone outside the shortlist keeps it — narrowing the menu must not
  // silently rewrite saved data the next time someone touches this form.
  const timezoneOptions = useMemo(
    () =>
      TIMEZONE_OPTIONS.some((option) => option.value === settings.timezone)
        ? TIMEZONE_OPTIONS
        : [{ value: settings.timezone, label: settings.timezone }, ...TIMEZONE_OPTIONS],
    [settings.timezone],
  );
  const [workingDays, setWorkingDays] = useState<Set<string>>(new Set(settings.workingDays));
  const [weekStartDay, setWeekStartDay] = useState(settings.weekStartDay);

  const saving = savingProfile || savingSettings;

  const profileDirty =
    name !== company.name ||
    description !== (company.description ?? "") ||
    website !== (company.website ?? "");

  const settingsDirty =
    timezone !== settings.timezone ||
    weekStartDay !== settings.weekStartDay ||
    [...workingDays].sort().join(",") !== [...settings.workingDays].sort().join(",");

  const dirty = profileDirty || settingsDirty;

  /**
   * The versions each half was opened with, sent back on save so a colleague's save in between is
   * refused (E00409) instead of overwritten.
   *
   * A half follows the latest version only while it is clean — clean means every field shows exactly
   * what the latest read holds, so the form *is* open on that version. Once somebody types, the
   * version is held. A refetch that brings a colleague's change then makes the half dirty (its fields
   * no longer match the read) and the held version refuses the save, which is the point.
   */
  const [profileVersion, setProfileVersion] = useState(company.version);
  const [settingsVersion, setSettingsVersion] = useState(settings.version);

  useEffect(() => {
    if (!profileDirty) setProfileVersion(company.version);
  }, [profileDirty, company.version]);

  useEffect(() => {
    if (!settingsDirty) setSettingsVersion(settings.version);
  }, [settingsDirty, settings.version]);

  const nameMissing = name.trim().length === 0;
  const noWorkingDays = workingDays.size === 0;

  const toggleDay = (value: string) =>
    setWorkingDays((previous) => {
      const next = new Set(previous);

      if (next.has(value)) next.delete(value);
      else next.add(value);

      return next;
    });

  const orderedWorkingDays = useMemo(
    () => DAYS.filter((day) => workingDays.has(day.value)).map((day) => day.value),
    [workingDays],
  );

  const handleCancel = () => {
    setName(company.name);
    setDescription(company.description ?? "");
    setWebsite(company.website ?? "");
    setTimezone(settings.timezone);
    setWorkingDays(new Set(settings.workingDays));
    setWeekStartDay(settings.weekStartDay);
  };

  /**
   * The two halves of this page are two endpoints, so a save fans out to whichever is actually
   * dirty. Sequential rather than parallel: if the profile call fails, the settings call never runs
   * and the form still shows one coherent error.
   */
  const handleSave = async () => {
    // After a save, the half holds the version that save produced. Following the read is not enough:
    // a name saved as "  Acme " comes back trimmed, the field still differs, the half stays dirty, and
    // the next save would be refused for a version this person moved themselves.
    if (profileDirty) {
      const saved = await onSaveProfile({
        name: name.trim(),
        description: description.trim() || null,
        website: website.trim() || null,
        version: profileVersion,
      });
      if (saved?.version !== undefined) setProfileVersion(saved.version);
    }

    if (settingsDirty) {
      const saved = await onSaveSettings({
        timezone,
        workingDays: orderedWorkingDays,
        weekStartDay,
        version: settingsVersion,
      });
      if (saved?.version !== undefined) setSettingsVersion(saved.version);
    }
  };

  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-0 flex-col gap-6 overflow-hidden px-12">
      <div className="flex flex-col gap-4">
        <SettingsPageHeader title="Company" backHref="/settings"/>

        <PageDescription>
          Who your company is inside the workspace and how it keeps time. The name and description
          travel with every profile, document and export; the working week drives calendars, time-off
          balances and every date the app calculates for you.
        </PageDescription>
      </div>

      {/* `overflow-y-auto` also clips horizontally, which ate the focus ring off the fields
         sitting at the left edge. The padding gives the ring its 3px, the negative margin
         takes it back off the layout. */}
      <div className="-mx-1 grid min-h-0 flex-1 grid-cols-2 gap-16 overflow-y-auto px-1">
        <Section
          icon={<Building2 className="h-4 w-4"/>}
          title="Company identity"
          description="How the company is named and introduced across the workspace."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field id="company-name" label="Company name">
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                aria-invalid={nameMissing}
                disabled={saving}
              />
            </Field>

            <SignInAddress subdomain={company.subdomain}/>
          </div>

          {nameMissing ? (
            <p className="m-0 -mt-2 text-xs text-destructive">A company name is required.</p>
          ) : null}

          <Field id="company-website" label="Website">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400"/>

              <Input
                id="company-website"
                className="pl-9"
                value={website}
                onChange={(e) => setWebsite(e.currentTarget.value)}
                disabled={saving}
              />
            </div>
          </Field>

          <Field id="company-description" label="Description">
            <Textarea
              id="company-description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              className="min-h-24 resize-none"
              disabled={saving}
            />
          </Field>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-xl">
              <AvatarImage src={company.companyLogo ?? undefined} alt={company.name}/>
              <AvatarFallback className="rounded-xl text-base">{initials(company.name)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <p className="m-0 text-sm font-medium">Logo</p>

              <p className="m-0 text-sm text-muted-foreground">
                Uploading a logo is coming soon. Until then the initials stand in for it.
              </p>
            </div>
          </div>
        </Section>

        <Section
          icon={<Clock className="h-4 w-4"/>}
          title="Localization &amp; time"
          description="The clock and the working week every calculated date is measured against."
        >
          <Field id="company-timezone" label="Timezone">
            <Select value={timezone} onValueChange={setTimezone} disabled={saving}>
              <SelectTrigger id="company-timezone" className="w-full">
                <SelectValue placeholder="Select a timezone"/>
              </SelectTrigger>

              <SelectContent className="max-h-72">
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="company-week-start" label="Week starts on" className="max-w-xs">
            <Select value={weekStartDay} onValueChange={setWeekStartDay} disabled={saving}>
              <SelectTrigger id="company-week-start" className="w-full">
                <SelectValue/>
              </SelectTrigger>

              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {titleCase(day.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-2">
            <Label className="mb-0">Working Days</Label>

            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const on = workingDays.has(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    aria-pressed={on}
                    disabled={saving}
                    className={cn(
                      "h-9 rounded-lg px-4 text-sm transition-colors",
                      on
                        ? "bg-brown-600 font-medium text-white"
                        : "bg-brown-50 text-[var(--color-text-secondary)] hover:bg-brown-100",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            {noWorkingDays ? (
              <p className="m-0 text-xs text-destructive">Select at least one working day.</p>
            ) : null}
          </div>
        </Section>
      </div>

      {profileError ? <p className="m-0 text-sm text-destructive">{profileError}</p> : null}
      {settingsError ? <p className="m-0 text-sm text-destructive">{settingsError}</p> : null}

      {dirty ? (
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || nameMissing || noWorkingDays}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
