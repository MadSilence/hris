"use client";

import { FC } from "react";
import { Building2, Globe, ImageIcon, Link2, MailQuestion } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/public/desact/src/components/ui/card";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Badge } from "@/public/desact/src/components/ui/badge";
import type { CompanyProfileSettings } from "../CompanyProfileSettingsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

type Props = {
  company: CompanyProfileSettings;
};

export const CompanyProfileSettingsComponent: FC<Props> = ({ company }) => {
  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader title="Company profile" backHref="/settings"/>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5"/>
                  Company identity
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Company full name</Label>
                  <Input defaultValue={company.fullName}/>
                </div>

                <div className="grid gap-2">
                  <Label>Company short name</Label>
                  <Input defaultValue={company.shortName}/>
                </div>

                <div className="grid gap-2">
                  <Label>Company domain</Label>
                  <Input defaultValue={company.domain}/>
                </div>

                <div className="grid gap-2">
                  <Label>Avatar initials</Label>
                  <Input defaultValue={company.avatarInitials} maxLength={3}/>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Brand tagline</Label>
                  <Input defaultValue={company.brandTagline}/>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea defaultValue={company.description} className="min-h-28 resize-none"/>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5"/>
                  Public links
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Website URL</Label>
                  <div className="relative">
                    <Link2
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"/>
                    <Input className="pl-9" defaultValue={company.websiteUrl}/>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Support URL</Label>
                  <div className="relative">
                    <MailQuestion
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"/>
                    <Input className="pl-9" defaultValue={company.supportUrl}/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>

          <aside className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5"/>
                  Company logo
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 rounded-2xl">
                    <AvatarImage src={company.logoUrl} alt={company.shortName}/>
                    <AvatarFallback className="rounded-2xl text-xl">
                      {company.avatarInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--color-text-primary)]">
                      {company.shortName}
                    </p>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      Used across workspace, emails and documents.
                    </p>
                  </div>
                </div>

                <Separator/>

                <div className="flex gap-3">
                  <Button className="flex-1">Upload logo</Button>
                  <Button variant="outline">Remove</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-2xl border bg-[var(--color-bg-secondary)] p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-11 w-11 rounded-xl">
                      <AvatarImage src={company.logoUrl} alt={company.shortName}/>
                      <AvatarFallback className="rounded-xl">
                        {company.avatarInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {company.shortName}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        {company.domain}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary">{company.brandTagline}</Badge>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </div>
  );
};
