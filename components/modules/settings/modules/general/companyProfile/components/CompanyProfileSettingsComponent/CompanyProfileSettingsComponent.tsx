"use client";

import { FC, useMemo, useState } from "react";
import { Building2, Clock, Globe, ImageIcon } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/public/desact/src/components/ui/card";
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
import type { Company } from "@/models/company/Company";
import type { CompanySettings } from "@/models/company/CompanySettings";
import type { UpdateCompanyRequest, UpdateCompanySettingsRequest } from "@/api/modules/company/dto/CompanyDTO";

type Props = {
  company: Company;
  settings: CompanySettings;
  onSaveProfile: (body: UpdateCompanyRequest) => Promise<void> | void;
  onSaveSettings: (body: UpdateCompanySettingsRequest) => Promise<void> | void;
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

const timezones: string[] = (() => {
  const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
  if (typeof fn === "function") return fn("timeZone");
  return ["UTC", "Europe/London", "Europe/Warsaw", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"];
})();

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

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
  // Profile form state
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description ?? "");
  const [website, setWebsite] = useState(company.website ?? "");

  // Localization form state
  const [timezone, setTimezone] = useState(settings.timezone);
  const [workingDays, setWorkingDays] = useState<Set<string>>(new Set(settings.workingDays));
  const [weekStartDay, setWeekStartDay] = useState(settings.weekStartDay);

  const profileDirty =
    name !== company.name ||
    description !== (company.description ?? "") ||
    website !== (company.website ?? "");

  const settingsDirty =
    timezone !== settings.timezone ||
    weekStartDay !== settings.weekStartDay ||
    [...workingDays].sort().join(",") !== [...settings.workingDays].sort().join(",");

  const canSaveProfile = name.trim().length > 0 && profileDirty && !savingProfile;
  const canSaveSettings = workingDays.size > 0 && settingsDirty && !savingSettings;

  const toggleDay = (value: string) =>
    setWorkingDays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const orderedWorkingDays = useMemo(
    () => DAYS.filter((d) => workingDays.has(d.value)).map((d) => d.value),
    [workingDays],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
      <SettingsPageHeader title="Company" backHref="/settings" />

      {/* Company identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company identity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Company name</Label>
            <Input value={name} onChange={(e) => setName(e.currentTarget.value)} disabled={savingProfile} />
          </div>

          <div className="grid gap-2">
            <Label>Subdomain</Label>
            <Input value={company.subdomain} disabled readOnly title="Subdomain can't be changed here" />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label>Website</Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
              <Input
                className="pl-9"
                value={website}
                onChange={(e) => setWebsite(e.currentTarget.value)}
                placeholder="https://example.com"
                disabled={savingProfile}
              />
            </div>
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              className="min-h-24 resize-none"
              disabled={savingProfile}
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Avatar className="h-14 w-14 rounded-xl">
              <AvatarImage src={company.companyLogo ?? undefined} alt={company.name} />
              <AvatarFallback className="rounded-xl">{initials(company.name)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Logo upload — coming soon
            </div>
          </div>

          {profileError && <p className="text-sm text-destructive md:col-span-2">{profileError}</p>}

          <div className="flex justify-end md:col-span-2">
            <Button onClick={() => onSaveProfile({ name: name.trim(), description: description.trim() || null, website: website.trim() || null })} disabled={!canSaveProfile}>
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Localization & time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Localization &amp; time
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2 md:max-w-md">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone} disabled={savingSettings}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = workingDays.has(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    disabled={savingSettings}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      on
                        ? "border-brown-300 bg-brown-100 text-brown-800"
                        : "border-brown-200 text-muted-foreground hover:bg-brown-50",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {workingDays.size === 0 && (
              <p className="text-xs text-destructive">Select at least one working day.</p>
            )}
          </div>

          <div className="grid gap-2 md:max-w-xs">
            <Label>Week starts on</Label>
            <Select value={weekStartDay} onValueChange={setWeekStartDay} disabled={savingSettings}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.value.charAt(0) + d.value.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settingsError && <p className="text-sm text-destructive">{settingsError}</p>}

          <div className="flex justify-end">
            <Button
              onClick={() => onSaveSettings({ timezone, workingDays: orderedWorkingDays, weekStartDay })}
              disabled={!canSaveSettings}
            >
              {savingSettings ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
