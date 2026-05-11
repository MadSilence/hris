"use client";

import { FC } from "react";
import { ImageIcon, LayoutDashboard, Palette } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/public/desact/src/components/ui/card";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { Separator } from "@/public/desact/src/components/ui/separator";
import {
  CompanyAppearanceSettings
} from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsContainer/CompanyAppearanceSettingsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

type Props = {
  appearance: CompanyAppearanceSettings;
};

export const CompanyAppearanceSettingsComponent: FC<Props> = ({ appearance }) => {
  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader title="Company appearance" backHref="/settings"/>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5"/>
                  Brand colors
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Interface primary color</Label>

                  <div className="flex gap-3">
                    <div
                      className="h-10 w-10 rounded-xl border"
                      style={{ backgroundColor: appearance.primaryColor }}
                    />
                    <Input defaultValue={appearance.primaryColor}/>
                  </div>
                </div>

                <Separator/>

                <div className="grid gap-3">
                  <Label>Accent colors</Label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {appearance.accentColors.map((color, index) => (
                      <div key={color} className="flex gap-3">
                        <div
                          className="h-10 w-10 rounded-xl border"
                          style={{ backgroundColor: color }}
                        />
                        <Input defaultValue={color} aria-label={`Accent color ${index + 1}`}/>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-fit">
                    Add accent color
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5"/>
                  Sidebar style
                </CardTitle>
              </CardHeader>

              <CardContent>
                <RadioGroup defaultValue={appearance.sidebarStyle} className="grid gap-4 md:grid-cols-2">
                  <Label className="cursor-pointer rounded-2xl border p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <RadioGroupItem value="light"/>
                      <span className="font-medium">Light sidebar</span>
                    </div>

                    <div className="rounded-xl border bg-white p-3">
                      <div className="mb-2 h-3 w-24 rounded bg-neutral-200"/>
                      <div className="h-3 w-32 rounded bg-neutral-100"/>
                    </div>
                  </Label>

                  <Label className="cursor-pointer rounded-2xl border p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <RadioGroupItem value="dark"/>
                      <span className="font-medium">Dark sidebar</span>
                    </div>

                    <div className="rounded-xl border bg-neutral-950 p-3">
                      <div className="mb-2 h-3 w-24 rounded bg-neutral-600"/>
                      <div className="h-3 w-32 rounded bg-neutral-800"/>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5"/>
                  Login background image
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <div
                  className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed bg-[var(--color-bg-secondary)] p-6 text-center">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Upload login background
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Recommended size: 1920 × 1080 px.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button>Upload image</Button>
                  <Button variant="outline">Remove</Button>
                </div>
              </CardContent>
            </Card>
          </main>

          <aside>
            <Card className="sticky top-4 overflow-hidden">
              <CardHeader>
                <CardTitle>Workspace preview</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="overflow-hidden rounded-2xl border bg-[var(--color-bg-secondary)]">
                  <div className="grid min-h-80 grid-cols-[96px_1fr]">
                    <div
                      className={appearance.sidebarStyle === "dark" ? "bg-neutral-950 p-3" : "bg-white p-3"}
                    >
                      <div
                        className="mb-5 h-9 w-9 rounded-xl"
                        style={{ backgroundColor: appearance.primaryColor }}
                      />

                      <div className="space-y-3">
                        <div className="h-3 rounded bg-neutral-400/50"/>
                        <div className="h-3 rounded bg-neutral-400/30"/>
                        <div className="h-3 rounded bg-neutral-400/30"/>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <div className="mb-2 h-4 w-32 rounded bg-neutral-300"/>
                          <div className="h-3 w-44 rounded bg-neutral-200"/>
                        </div>

                        <div
                          className="h-9 w-20 rounded-xl"
                          style={{ backgroundColor: appearance.primaryColor }}
                        />
                      </div>

                      <div className="grid gap-3">
                        {appearance.accentColors.slice(0, 3).map((color) => (
                          <div key={color} className="rounded-xl border bg-white p-3">
                            <div
                              className="mb-3 h-2 w-16 rounded"
                              style={{ backgroundColor: color }}
                            />
                            <div className="mb-2 h-3 w-full rounded bg-neutral-200"/>
                            <div className="h-3 w-2/3 rounded bg-neutral-100"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
