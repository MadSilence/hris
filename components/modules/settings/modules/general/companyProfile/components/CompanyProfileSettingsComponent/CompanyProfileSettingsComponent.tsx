"use client";

import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Building03Icon, Clock01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { cn } from "@/lib/cn";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import type { Company } from "@/models/company/Company";
import type { CompanySettings } from "@/models/company/CompanySettings";
import type { UpdateCompanyRequest, UpdateCompanySettingsRequest } from "@/api/modules/company/dto/CompanyDTO";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { companyHost, companyOrigin } from "@/lib/companyAddress";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import {
  deleteCompanyLogoAction,
  uploadCompanyLogoAction,
} from "@/components/modules/settings/modules/general/companyProfile/actions/companyLogoActions";
import { timeZoneChoices } from "@/lib/timeZones";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FieldError } from "@/components/desact/field-error";
import { useTranslations } from "next-intl";
import { LOCALES, type Language } from "@/i18n/locales";
import { FormError } from "@/components/feedback/FormError";

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
  /** Re-reads the company after the logo changed, so the sidebar and this page draw the new one. */
  onLogoChanged?: () => Promise<unknown> | void;
};

/** The week, with the catalogue keys of each day's short (the toggles) and full (the week-start menu) name. */
const DAYS = [
  { value: "MONDAY", short: "days.monday.short", long: "days.monday.long" },
  { value: "TUESDAY", short: "days.tuesday.short", long: "days.tuesday.long" },
  { value: "WEDNESDAY", short: "days.wednesday.short", long: "days.wednesday.long" },
  { value: "THURSDAY", short: "days.thursday.short", long: "days.thursday.long" },
  { value: "FRIDAY", short: "days.friday.short", long: "days.friday.long" },
  { value: "SATURDAY", short: "days.saturday.short", long: "days.saturday.long" },
  { value: "SUNDAY", short: "days.sunday.short", long: "days.sunday.long" },
] as const;

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const Section: FC<{
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}> = ({ icon, title, description, children }) => (
  <section className="flex flex-col gap-5">
    <div>
      <h2 className="m-0 flex items-center gap-2 text-body font-semibold text-primary">
        {icon}
        {title}
      </h2>

      <p className="m-0 mt-1.5 text-body text-tertiary">{description}</p>
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
  const t = useTranslations("settings.company");
  const tCommon = useTranslations("common");

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
      <Label className="mb-0">{t("signInAddress")}</Label>

      <div className="flex h-9 min-w-0 items-center justify-between gap-2">
        <span data-test="company-sign-in-address" className="truncate text-body text-primary">{address}</span>

        <Button type="button" variant="secondary" size="sm" onClick={copy}>
          {copied ? tCommon("states.copied") : tCommon("actions.copy")}
        </Button>
      </div>
    </div>
  );
};

/**
 * Upload, replace or remove the company logo. The file goes up as soon as it is chosen — a logo is
 * not part of the profile form's draft, and holding an image in a draft only to lose it on Cancel
 * would be worse than applying it at once. A refusal arrives as the card: the picker has closed.
 */
const LogoControls: FC<{ hasLogo: boolean; onChanged?: () => Promise<unknown> | void }> = ({
  hasLogo,
  onChanged,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const t = useTranslations("settings.company");
  const tCommon = useTranslations("common");

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await uploadCompanyLogoAction(form);
      if (res.status !== ActionStatus.SUCCESS) {
        showActionError(res);
        return;
      }
      await onChanged?.();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await deleteCompanyLogoAction();
      if (res.status !== ActionStatus.SUCCESS) {
        showActionError(res);
        return;
      }
      await onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-body font-medium">{t("logo.title")}</p>
      <p className="m-0 text-body text-tertiary">
        {hasLogo ? t("logo.shown") : t("logo.initials")}
      </p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? t("logo.working") : hasLogo ? t("logo.replace") : t("logo.upload")}
        </Button>
        {hasLogo ? (
          <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void remove()}>
            {tCommon("actions.remove")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const CompanyProfileSettingsComponent: FC<Props> = ({
  company,
  settings,
  onSaveProfile,
  onSaveSettings,
  onLogoChanged,
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
  // The same offered zones as a person's own preference (`lib/timeZones`): stored as IANA so daylight
  // saving keeps working, labelled by offset and city, and the company's zone kept even when it is not
  // one of them.
  const timezoneOptions = useMemo(
    () =>
      timeZoneChoices(settings.timezone).map((choice) => ({
        value: choice.zone,
        label: choice.label,
        keywords: choice.keywords,
      })),
    [settings.timezone],
  );
  const [workingDays, setWorkingDays] = useState<Set<string>>(new Set(settings.workingDays));
  const [weekStartDay, setWeekStartDay] = useState(settings.weekStartDay);
  const [language, setLanguage] = useState(settings.language);
  const t = useTranslations("settings.company");
  const tCommon = useTranslations("common");

  const saving = savingProfile || savingSettings;

  const profileDirty =
    name !== company.name ||
    description !== (company.description ?? "") ||
    website !== (company.website ?? "");

  const settingsDirty =
    timezone !== settings.timezone ||
    weekStartDay !== settings.weekStartDay ||
    language !== settings.language ||
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
    setLanguage(settings.language);
  };

  /**
   * The two halves of this page are two endpoints, so a save fans out to whichever is actually
   * dirty. Sequential rather than parallel: if the profile call fails, the settings call never runs
   * and the form still shows one coherent error.
   */
  const handleSave = async () => {
    // A missing name or no working day already says so under its field.
    if (nameMissing || noWorkingDays) return;
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
        language,
        version: settingsVersion,
      });
      if (saved?.version !== undefined) setSettingsVersion(saved.version);
    }
  };

  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-0 flex-col gap-6 overflow-hidden px-12">
      <div className="flex flex-col gap-4">
        <SettingsPageHeader title={t("title")} backHref="/settings"/>

        <PageDescription>
          {t("description")}
        </PageDescription>
      </div>

      {/* `overflow-y-auto` also clips horizontally, which ate the focus ring off the fields
         sitting at the left edge. The padding gives the ring its 3px, the negative margin
         takes it back off the layout. */}
      <div className="-mx-1 grid min-h-0 flex-1 grid-cols-2 gap-16 overflow-y-auto px-1">
        <Section
          icon={<Icon icon={Building03Icon} size="sm" />}
          title={t("identity.title")}
          description={t("identity.description")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field id="company-name" label={t("identity.name")}>
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
            <FieldError>{t("identity.nameRequired")}</FieldError>
          ) : null}

          <Field id="company-website" label={t("identity.website")}>
            <div className="relative">
              <Icon icon={Globe02Icon} size="sm" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />

              <Input
                id="company-website"
                className="pl-9"
                value={website}
                onChange={(e) => setWebsite(e.currentTarget.value)}
                disabled={saving}
              />
            </div>
          </Field>

          <Field id="company-description" label={tCommon("fields.description")}>
            <Textarea
              id="company-description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              className="min-h-24 resize-none"
              disabled={saving}
            />
          </Field>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-popover">
              <AvatarImage src={company.companyLogo ?? undefined} alt={company.name}/>
              <AvatarFallback className="rounded-popover text-body">{initials(company.name)}</AvatarFallback>
            </Avatar>

            <LogoControls hasLogo={!!company.companyLogo} onChanged={onLogoChanged}/>
          </div>
        </Section>

        <Section
          icon={<Icon icon={Clock01Icon} size="sm" />}
          title={t("time.title")}
          description={t("time.description")}
        >
          <Field id="company-timezone" label={t("time.timezone")}>
            <SearchableSelect
              id="company-timezone"
              options={timezoneOptions}
              value={timezone || null}
              onChange={(v) => v && setTimezone(v)}
              placeholder={t("time.timezonePlaceholder")}
              disabled={saving}
              clearable={false}
            />
          </Field>

          <Field id="company-language" label={t("language.label")} className="max-w-xs">
            <Select value={language} onValueChange={setLanguage} disabled={saving}>
              <SelectTrigger id="company-language" className="w-full">
                <SelectValue/>
              </SelectTrigger>

              <SelectContent>
                {LOCALES.map((code: Language) => (
                  <SelectItem key={code} value={code}>
                    {tCommon(`language.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-hint text-secondary">{t("language.hint")}</p>
          </Field>

          <Field id="company-week-start" label={t("time.weekStart")} className="max-w-xs">
            <Select value={weekStartDay} onValueChange={setWeekStartDay} disabled={saving}>
              <SelectTrigger id="company-week-start" className="w-full">
                <SelectValue/>
              </SelectTrigger>

              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {t(day.long)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-2">
            <Label className="mb-0">{t("time.workingDays")}</Label>

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
                      "h-9 rounded-control px-4 text-body transition-colors",
                      on
                        ? "bg-accent font-medium text-on-accent"
                        : "bg-subtle text-secondary hover:bg-mist",
                    )}
                  >
                    {t(day.short)}
                  </button>
                );
              })}
            </div>

            {noWorkingDays ? (
              <FieldError>{t("time.noWorkingDays")}</FieldError>
            ) : null}
          </div>
        </Section>
      </div>

      {profileError ? <FormError message={profileError} /> : null}
      {settingsError ? <FormError message={settingsError} /> : null}

      {dirty ? (
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
            {tCommon("actions.cancel")}
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving} loading={saving} loadingLabel={tCommon("actions.saving")}
          >
            {tCommon("actions.saveChanges")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
