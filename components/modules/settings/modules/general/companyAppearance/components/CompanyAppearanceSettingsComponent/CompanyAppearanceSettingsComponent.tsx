"use client";

import { ChangeEvent, FC, ReactNode, useMemo, useRef, useState } from "react";
import { Check, ImageIcon, ImagePlus, Palette } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { cn } from "@/public/desact/src/components/ui/utils";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { BRAND_STEPS, buildBrandPalette } from "@/lib/theme/brandPalette";
import { isValidHex } from "@/lib/theme/oklch";
import { AppearancePreview } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearancePreview";
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
  companyName?: string | null;
};

const MAX_HEADLINE = 120;
const MAX_SUBHEADLINE = 240;

const normaliseHex = (value: string) => {
  const trimmed = value.trim();
  return (trimmed.startsWith("#") ? trimmed : `#${trimmed}`).toLowerCase();
};

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

const ToggleRow: FC<{
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}> = ({ id, label, checked, disabled, onChange }) => (
  <div className="flex items-center gap-3">
    <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange}/>

    {/* The shared Label carries `mb-2` for stacked fields; in a row it pushes the text off the
        switch's centre line. `leading-5` matches the 20px track, so the two centre together. */}
    <Label
      htmlFor={id}
      className={cn(
        "mb-0 text-sm font-normal leading-5",
        disabled && "text-muted-foreground",
      )}
    >
      {label}
    </Label>
  </div>
);

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
  companyName,
}) => {
  const [brandColor, setBrandColor] = useState<string | null>(appearance.brandColor);
  const [customHex, setCustomHex] = useState(appearance.brandColor ?? "");
  const [headline, setHeadline] = useState(appearance.loginHeadline ?? "");
  const [subheadline, setSubheadline] = useState(appearance.loginSubheadline ?? "");
  const [imageOnLogin, setImageOnLogin] = useState(appearance.useImageOnLogin);
  const [imageOnDashboard, setImageOnDashboard] = useState(appearance.useImageOnDashboard);
  const [sidebarContrast, setSidebarContrast] = useState(appearance.sidebarContrast);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    brandColor !== appearance.brandColor ||
    headline !== (appearance.loginHeadline ?? "") ||
    subheadline !== (appearance.loginSubheadline ?? "") ||
    imageOnLogin !== appearance.useImageOnLogin ||
    imageOnDashboard !== appearance.useImageOnDashboard ||
    sidebarContrast !== appearance.sidebarContrast;

  const customHexInvalid = customHex.trim().length > 0 && !isValidHex(normaliseHex(customHex));

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

  const handleCancel = () => {
    setBrandColor(appearance.brandColor);
    setCustomHex(appearance.brandColor ?? "");
    setHeadline(appearance.loginHeadline ?? "");
    setSubheadline(appearance.loginSubheadline ?? "");
    setImageOnLogin(appearance.useImageOnLogin);
    setImageOnDashboard(appearance.useImageOnDashboard);
    setSidebarContrast(appearance.sidebarContrast);
  };

  const handleSave = () =>
    onSave({
      brandColor,
      loginHeadline: headline.trim() || null,
      loginSubheadline: subheadline.trim() || null,
      useImageOnLogin: imageOnLogin,
      useImageOnDashboard: imageOnDashboard,
      sidebarContrast,
    });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Cleared first: picking the same file twice must still fire a change event.
    event.target.value = "";

    if (file) {
      await onUploadLoginImage(file);
    }
  };

  const hasImage = Boolean(appearance.loginImageUrl);

  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-0 flex-col gap-6 overflow-hidden px-12">
      <div className="flex flex-col gap-4">
        <SettingsPageHeader title="Appearance" backHref="/settings"/>

        <PageDescription>
          How the workspace looks to everyone in your company: one seed colour generates the whole
          palette the app paints with, and one uploaded image can back the login screen, the
          dashboard, or both. The preview on the right shows the result before anyone else sees it.
        </PageDescription>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-10">
        {/* `overflow-y-auto` also clips horizontally, which ate the focus ring off the fields
           sitting at the left edge. The padding gives the ring its 3px, the negative margin
           takes it back off the layout. */}
        <div className="-mx-1 flex min-h-0 flex-col gap-7 overflow-y-auto px-1">
          <Section
            icon={<Palette className="h-4 w-4"/>}
            title="Brand colour"
            description="Surfaces stay near-grey and only actions carry the full colour, whichever you pick."
          >
            <div className="flex flex-wrap gap-3">
              {BRAND_PRESETS.map((preset) => {
                const selected = brandColor === preset.color;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset.color)}
                    aria-label={preset.label}
                    aria-pressed={selected}
                    title={preset.label}
                    disabled={saving}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full transition-shadow",
                      selected
                        ? "ring-2 ring-brown-600 ring-offset-2"
                        : "ring-1 ring-black/10 hover:ring-black/25",
                    )}
                    style={{ backgroundColor: preset.color ?? DEFAULT_BRAND_SWATCH }}
                  >
                    {selected ? <Check className="h-4 w-4 text-white"/> : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="brand-hex" className="mb-0 shrink-0 leading-5">Custom colour</Label>

              <Input
                id="brand-hex"
                value={customHex}
                placeholder={DEFAULT_BRAND_SWATCH}
                onChange={(e) => handleCustomHexChange(e.currentTarget.value)}
                aria-invalid={customHexInvalid}
                disabled={saving}
                className="w-28 shrink-0"
              />

              {generatedScale ? (
                <div className="flex h-9 flex-1 overflow-hidden rounded-lg">
                  {BRAND_STEPS.map((step) => (
                    <span
                      key={step}
                      className="h-full flex-1"
                      style={{ backgroundColor: generatedScale[step] }}
                      title={`${step} — ${generatedScale[step]}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="m-0 text-xs text-muted-foreground">
                  Leave empty to keep the default palette.
                </p>
              )}
            </div>

            {customHexInvalid ? (
              <p className="m-0 -mt-2 text-xs text-destructive">
                Enter a hex colour such as #2563eb.
              </p>
            ) : null}

            <ToggleRow
              id="sidebar-contrast"
              label="Make sidebar contrast"
              checked={sidebarContrast}
              disabled={saving}
              onChange={setSidebarContrast}
            />
          </Section>

          <div className="border-t border-brown-200"/>

          <Section
            icon={<ImageIcon className="h-4 w-4"/>}
            title="Sign in experience"
            description="The artwork and the words people meet before they are signed in."
          >
            <div className="flex items-start gap-5">
              <button
                type="button"
                aria-label="Choose a background image"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || removingImage}
                className={cn(
                  "relative h-32 w-64 shrink-0 overflow-hidden rounded-xl transition-colors",
                  hasImage
                    ? "hover:opacity-90"
                    : "grid place-items-center border border-dashed border-brown-200 bg-brown-50/60 px-3 text-center text-xs text-muted-foreground hover:bg-brown-50",
                )}
              >
                {appearance.loginImageUrl ? (
                  <>
                    {/* Backend-hosted upload of unknown dimensions; next/image would need a remote
                        pattern for the API origin in next.config. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={appearance.loginImageUrl}
                      alt="Login background"
                      className="h-full w-full object-cover"
                    />
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <ImagePlus className="h-5 w-5 text-brown-400"/>
                    Click to choose an image
                  </span>
                )}
              </button>

              <div className="flex min-w-0 flex-col items-start gap-2.5">
                <p className="m-0 text-sm font-medium">Login screen</p>

                <p className="m-0 text-sm text-muted-foreground">
                  PNG, JPEG or WebP, up to 10 MB. The image is stored as soon as it is uploaded.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || removingImage}
                  >
                    {uploadingImage ? "Uploading…" : hasImage ? "Replace image" : "Upload image"}
                  </Button>

                  {hasImage ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveLoginImage()}
                      disabled={uploadingImage || removingImage}
                    >
                      {removingImage ? "Removing…" : "Remove"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <ToggleRow
                id="image-on-login"
                label="Use as login background"
                checked={imageOnLogin}
                disabled={saving || !hasImage}
                onChange={setImageOnLogin}
              />

              <ToggleRow
                id="image-on-dashboard"
                label="Use as company dashboard background"
                checked={imageOnDashboard}
                disabled={saving || !hasImage}
                onChange={setImageOnDashboard}
              />
            </div>

            {imageError ? <p className="m-0 text-sm text-destructive">{imageError}</p> : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-headline">Headline</Label>

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
          </Section>

          {saveError ? <p className="m-0 text-sm text-destructive">{saveError}</p> : null}

          {dirty ? (
            <div className="mt-auto flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>

              <Button type="button" onClick={handleSave} disabled={saving || customHexInvalid}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </div>

        <AppearancePreview
          brandColor={brandColor}
          loginImageUrl={appearance.loginImageUrl}
          headline={headline}
          subheadline={subheadline}
          companyName={companyName}
          imageOnLogin={imageOnLogin}
          imageOnDashboard={imageOnDashboard}
          sidebarContrast={sidebarContrast}
        />
      </div>
    </div>
  );
};
