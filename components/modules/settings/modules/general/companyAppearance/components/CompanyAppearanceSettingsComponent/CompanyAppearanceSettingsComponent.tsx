"use client";

import { ChangeEvent, FC, useMemo, useRef, useState } from "react";
import { Check, ImageIcon, Palette, Type } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/public/desact/src/components/ui/card";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { cn } from "@/public/desact/src/components/ui/utils";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { BRAND_STEPS, buildBrandPalette, buildBrandStyleSheet } from "@/lib/theme/brandPalette";
import { isValidHex } from "@/lib/theme/oklch";
import {
  BRAND_PRESETS,
  DEFAULT_BRAND_SWATCH,
} from "@/components/modules/settings/modules/general/companyAppearance/utils/brandPresets";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";

type Props = {
  appearance: CompanyAppearance;
  onSave: (body: UpdateCompanyAppearanceRequest) => Promise<void> | void;
  onUploadLoginImage: (file: File) => Promise<void> | void;
  onRemoveLoginImage: () => Promise<void> | void;
  saving: boolean;
  uploadingImage: boolean;
  removingImage: boolean;
  saveError: string | null;
  imageError: string | null;
};

const MAX_HEADLINE = 120;
const MAX_SUBHEADLINE = 240;

const normaliseHex = (value: string) => {
  const trimmed = value.trim();
  return (trimmed.startsWith("#") ? trimmed : `#${trimmed}`).toLowerCase();
};

export const CompanyAppearanceSettingsComponent: FC<Props> = ({
  appearance,
  onSave,
  onUploadLoginImage,
  onRemoveLoginImage,
  saving,
  uploadingImage,
  removingImage,
  saveError,
  imageError,
}) => {
  const [brandColor, setBrandColor] = useState<string | null>(appearance.brandColor);
  const [customHex, setCustomHex] = useState(appearance.brandColor ?? "");
  const [headline, setHeadline] = useState(appearance.loginHeadline ?? "");
  const [subheadline, setSubheadline] = useState(appearance.loginSubheadline ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    brandColor !== appearance.brandColor ||
    headline !== (appearance.loginHeadline ?? "") ||
    subheadline !== (appearance.loginSubheadline ?? "");

  const customHexInvalid = customHex.trim().length > 0 && !isValidHex(normaliseHex(customHex));

  /**
   * Repaints this whole page with the unsaved colour. Rendered after the root layout's server-side
   * block, so it wins on source order — which makes the entire settings screen the preview, not just
   * a swatch strip. Reverting the draft drops it and the saved theme comes back.
   */
  const previewStyleSheet = useMemo(
    () => (brandColor === appearance.brandColor ? "" : buildBrandStyleSheet(brandColor)),
    [brandColor, appearance.brandColor],
  );

  const generatedScale = useMemo(
    () => (brandColor ? buildBrandPalette(brandColor)?.scale ?? null : null),
    [brandColor],
  );

  const handlePresetClick = (color: string | null) => {
    setBrandColor(color);
    setCustomHex(color ?? "");
  };

  const handleCustomHexChange = (value: string) => {
    setCustomHex(value);

    if (value.trim().length === 0) {
      setBrandColor(null);
      return;
    }

    const normalised = normaliseHex(value);

    if (isValidHex(normalised)) {
      setBrandColor(normalised);
    }
  };

  const handleReset = () => {
    setBrandColor(appearance.brandColor);
    setCustomHex(appearance.brandColor ?? "");
    setHeadline(appearance.loginHeadline ?? "");
    setSubheadline(appearance.loginSubheadline ?? "");
  };

  const handleSave = () =>
    onSave({
      brandColor,
      loginHeadline: headline.trim() || null,
      loginSubheadline: subheadline.trim() || null,
    });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Cleared first: picking the same file twice must still fire a change event.
    event.target.value = "";

    if (file) {
      await onUploadLoginImage(file);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6">
      {previewStyleSheet ? (
        <style data-brand-theme-preview dangerouslySetInnerHTML={{ __html: previewStyleSheet }}/>
      ) : null}

      <SettingsPageHeader title="Appearance" backHref="/settings"/>

      <p className="-mt-2 text-sm text-muted-foreground">
        One colour drives the whole workspace. Everything on this page repaints as you choose — nothing
        is stored until you save.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5"/>
            Brand colour
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label>Presets</Label>

            <div className="flex flex-wrap gap-3">
              {BRAND_PRESETS.map((preset) => {
                const selected = brandColor === preset.color;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset.color)}
                    aria-pressed={selected}
                    disabled={saving}
                    className={cn(
                      "flex w-20 flex-col items-center gap-2 rounded-xl border p-2 transition-colors",
                      selected
                        ? "border-brown-500 bg-brown-50"
                        : "border-brown-200 hover:bg-brown-50/60",
                    )}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: preset.color ?? DEFAULT_BRAND_SWATCH }}
                    >
                      {selected ? <Check className="h-4 w-4 text-white"/> : null}
                    </span>

                    <span className="text-xs text-[var(--color-text-secondary)]">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator/>

          <div className="grid gap-2 md:max-w-xs">
            <Label htmlFor="brand-hex">Custom colour</Label>

            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-xl border border-brown-200"
                style={{ backgroundColor: brandColor ?? DEFAULT_BRAND_SWATCH }}
              />

              <Input
                id="brand-hex"
                value={customHex}
                placeholder={DEFAULT_BRAND_SWATCH}
                onChange={(e) => handleCustomHexChange(e.currentTarget.value)}
                aria-invalid={customHexInvalid}
                disabled={saving}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {customHexInvalid
                ? "Enter a hex colour such as #2563eb."
                : "Leave empty to keep the default palette."}
            </p>
          </div>

          {generatedScale ? (
            <div className="grid gap-2">
              <Label>Generated palette</Label>

              <div className="flex overflow-hidden rounded-xl border border-brown-200">
                {BRAND_STEPS.map((step) => (
                  <span
                    key={step}
                    className="h-10 flex-1"
                    style={{ backgroundColor: generatedScale[step] }}
                    title={`${step} — ${generatedScale[step]}`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Surfaces stay near-grey and only actions carry the full colour, so the interface keeps
                the contrast it was designed with whichever colour you pick.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5"/>
            Login screen
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Stored and ready, but not shown yet — the login page picks these up when it moves to
            two-step sign-in.
          </p>

          <div className="grid gap-3">
            <Label>Background image</Label>

            {appearance.loginImageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-brown-200">
                {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern
                    for the API origin in next.config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={appearance.loginImageUrl}
                  alt="Login background"
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-brown-200 bg-brown-50/40 p-6 text-center">
                <div>
                  <p className="text-sm font-medium">No background image</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPEG or WebP, up to 10 MB. 1920 x 1080 px works best.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || removingImage}
              >
                {uploadingImage
                  ? "Uploading…"
                  : appearance.loginImageUrl
                    ? "Replace image"
                    : "Upload image"}
              </Button>

              {appearance.loginImageUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onRemoveLoginImage()}
                  disabled={uploadingImage || removingImage}
                >
                  {removingImage ? "Removing…" : "Remove"}
                </Button>
              ) : null}

              <span className="text-xs text-muted-foreground">Image changes apply immediately.</span>
            </div>

            {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <Separator/>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="login-headline" className="flex items-center gap-2">
                <Type className="h-4 w-4"/>
                Headline
              </Label>

              <Input
                id="login-headline"
                value={headline}
                maxLength={MAX_HEADLINE}
                placeholder="Welcome to SixSoftware"
                onChange={(e) => setHeadline(e.currentTarget.value)}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-subheadline">Sub-heading</Label>

              <Input
                id="login-subheadline"
                value={subheadline}
                maxLength={MAX_SUBHEADLINE}
                placeholder="Sign in to continue to your workspace."
                onChange={(e) => setSubheadline(e.currentTarget.value)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-brown-200 bg-[var(--color-bg-primary)] px-6 py-4">
        <Button type="button" variant="outline" onClick={handleReset} disabled={!dirty || saving}>
          Reset
        </Button>

        <Button type="button" onClick={handleSave} disabled={!dirty || saving || customHexInvalid}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
};
