"use client";

import { ChangeEvent, FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Image01Icon, ImageAdd01Icon, PaintBoardIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Switch } from "@/components/desact/switch";
import { cn } from "@/lib/cn";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import {
  ACCENT_PRESET_LABELS,
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  deriveAccentInputs,
  isAccentPreset,
  isHexColor,
  type AccentPreset,
} from "@/lib/theme/accent";
import { AppearancePreview } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearancePreview";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  appearance: CompanyAppearance;
  /** Resolves with what was saved, when the caller has it, so the form holds the version it produced. */
  onSave: (body: UpdateCompanyAppearanceRequest) => Promise<{ version?: number } | undefined | void> | void;
  onUploadLoginImage: (file: File) => Promise<void> | void;
  onRemoveLoginImage: () => Promise<void> | void;
  saving: boolean;
  uploadingImage: boolean;
  removingImage: boolean;
  saveError: string | null;
  imageError: string | null;
  companyName?: string | null;
  logoUrl?: string | null;
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
      <h2 className="m-0 flex items-center gap-2 text-body font-semibold text-primary">
        {icon}
        {title}
      </h2>

      <p className="m-0 mt-1.5 text-body text-tertiary">{description}</p>
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
        "mb-0 text-body font-normal leading-5",
        disabled && "text-tertiary",
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
  logoUrl,
}) => {
  const [accent, setAccent] = useState<string | null>(appearance.accent);
  const [customHex, setCustomHex] = useState(isAccentPreset(appearance.accent) ? "" : appearance.accent ?? "");
  const [headline, setHeadline] = useState(appearance.loginHeadline ?? "");
  const [subheadline, setSubheadline] = useState(appearance.loginSubheadline ?? "");
  const [imageOnLogin, setImageOnLogin] = useState(appearance.useImageOnLogin);
  const [imageOnDashboard, setImageOnDashboard] = useState(appearance.useImageOnDashboard);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    accent !== appearance.accent ||
    headline !== (appearance.loginHeadline ?? "") ||
    subheadline !== (appearance.loginSubheadline ?? "") ||
    imageOnLogin !== appearance.useImageOnLogin ||
    imageOnDashboard !== appearance.useImageOnDashboard;

  /**
   * The version the form was opened with, sent back on save so a colleague's save in between is
   * refused (E00409) instead of overwritten. It follows the latest read only while the form is clean
   * — clean means every field shows exactly what that read holds. Once somebody types it is held, and
   * a refetch bringing a colleague's change makes the form dirty, so the held version refuses the save.
   * After this form's own save it holds the version that save produced (see `handleSave`).
   */
  const [version, setVersion] = useState(appearance.version);

  useEffect(() => {
    if (!dirty) setVersion(appearance.version);
  }, [dirty, appearance.version]);

  const customHexInvalid = customHex.trim().length > 0 && !isHexColor(normaliseHex(customHex));

  /** A preset is shown selected; a custom colour selects none of them. */
  const selectedPreset: AccentPreset | null = accent === null ? DEFAULT_ACCENT : isAccentPreset(accent) ? accent : null;

  /**
   * Whether a custom colour's links had to be darkened to read at 4.5:1 (SPEC § 4.4). The fill stays the
   * colour as picked; the admin is told, in the package's own words.
   */
  const adjusted = useMemo(
    () => (accent && !isAccentPreset(accent) && isHexColor(accent) ? deriveAccentInputs(accent).adjusted : false),
    [accent],
  );

  const handlePresetClick = (preset: AccentPreset) => {
    setAccent(preset === DEFAULT_ACCENT ? null : preset);
    setCustomHex("");
  };

  const handleCustomHexChange = (value: string) => {
    setCustomHex(value);

    if (value.trim().length === 0) {
      setAccent(null);
      return;
    }

    const normalised = normaliseHex(value);

    if (isHexColor(normalised)) {
      setAccent(normalised);
    }
  };

  const handleCancel = () => {
    setAccent(appearance.accent);
    setCustomHex(isAccentPreset(appearance.accent) ? "" : appearance.accent ?? "");
    setHeadline(appearance.loginHeadline ?? "");
    setSubheadline(appearance.loginSubheadline ?? "");
    setImageOnLogin(appearance.useImageOnLogin);
    setImageOnDashboard(appearance.useImageOnDashboard);
  };

  const handleSave = async () => {
    const saved = await onSave({
      accent,
      loginHeadline: headline.trim() || null,
      loginSubheadline: subheadline.trim() || null,
      useImageOnLogin: imageOnLogin,
      useImageOnDashboard: imageOnDashboard,
      version,
    });
    // Following the read is not enough here: a headline saved as "  Welcome " comes back trimmed, the
    // field still differs, the form stays dirty, and the next save would be refused for a version
    // this person moved themselves.
    if (saved && saved.version !== undefined) setVersion(saved.version);
  };

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
          How the workspace looks to everyone in your company: your color marks what to act on —
          buttons, links, the active page — and one uploaded image can back the sign-in screen, the
          dashboard, or both. The preview on the right shows the result before anyone else sees it.
        </PageDescription>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-10">
        {/* `overflow-y-auto` also clips horizontally, which ate the focus ring off the fields
           sitting at the left edge. The padding gives the ring its 3px, the negative margin
           takes it back off the layout. */}
        <div className="-mx-1 flex min-h-0 flex-col gap-7 overflow-y-auto px-1">
          <Section
            icon={<Icon icon={PaintBoardIcon} size="sm" />}
            title="Workspace color"
            description="Your color marks the one thing to act on. Text, surfaces and status colors stay noddo's, whichever you pick."
          >
            {/* The ten presets of SPEC § 4.3. Each swatch is the preset's own colour — the only place a component
                paints a HEX, because the swatch is the value being chosen. */}
            <div className="flex flex-wrap gap-3" role="group" aria-label="Workspace colors">
              {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((preset) => {
                const selected = selectedPreset === preset;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    aria-label={ACCENT_PRESET_LABELS[preset]}
                    aria-pressed={selected}
                    title={ACCENT_PRESET_LABELS[preset]}
                    disabled={saving}
                    className={cn(
                      "grid size-9 place-items-center rounded-pill transition-shadow duration-(--duration-hover)",
                      selected ? "ring-2 ring-primary ring-offset-2" : "ring-1 ring-divider hover:ring-strong",
                    )}
                    style={{ backgroundColor: ACCENT_PRESETS[preset] }}
                  >
                    {selected ? <Icon icon={Tick02Icon} size="sm" className="text-on-inverse" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="accent-hex" className="mb-0 shrink-0">Custom color</Label>

              <Input
                id="accent-hex"
                value={customHex}
                placeholder="#2f63c4"
                onChange={(e) => handleCustomHexChange(e.currentTarget.value)}
                aria-invalid={customHexInvalid}
                disabled={saving}
                className="w-28 shrink-0 font-mono"
              />

              {accent && !isAccentPreset(accent) && isHexColor(accent) ? (
                <span aria-hidden className="size-9 shrink-0 rounded-control ring-1 ring-divider" style={{ backgroundColor: accent }} />
              ) : (
                <p className="m-0 text-hint text-tertiary">Leave empty to use a preset.</p>
              )}
            </div>

            {customHexInvalid ? (
              <FieldError>Enter a color as #rrggbb, like #2f63c4.</FieldError>
            ) : null}

            {adjusted ? <p className="m-0 -mt-2 text-hint text-tertiary">We adjusted your color for readability.</p> : null}
          </Section>

          <div className="border-t border-divider"/>

          <Section
            icon={<Icon icon={Image01Icon} size="sm" />}
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
                  "relative h-32 w-64 shrink-0 overflow-hidden rounded-popover transition-colors",
                  hasImage
                    ? "hover:opacity-90"
                    : "grid place-items-center border border-dashed border-divider bg-subtle/60 px-3 text-center text-hint text-tertiary hover:bg-subtle",
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
                    <Icon icon={ImageAdd01Icon} className="text-tertiary" />
                    Click to choose an image
                  </span>
                )}
              </button>

              <div className="flex min-w-0 flex-col items-start gap-2.5">
                <p className="m-0 text-body font-medium">Login screen</p>

                <p className="m-0 text-body text-tertiary">
                  PNG, JPEG or WebP, up to 10 MB. The image is stored as soon as it is uploaded.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || removingImage}
                  >
                    {uploadingImage ? "Uploading…" : hasImage ? "Replace image" : "Upload image"}
                  </Button>

                  {hasImage ? (
                    <Button
                      type="button"
                      variant="secondary"
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

            {imageError ? <FormError message={imageError} /> : null}

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
                  onChange={(e) => setSubheadline(e.currentTarget.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </Section>

          {saveError ? <FormError message={saveError} /> : null}

          {dirty ? (
            <div className="mt-auto flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>

              <Button type="button" onClick={handleSave} disabled={saving || customHexInvalid}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </div>

        <AppearancePreview
          accent={accent}
          loginImageUrl={appearance.loginImageUrl}
          headline={headline}
          subheadline={subheadline}
          companyName={companyName}
          logoUrl={logoUrl}
          imageOnLogin={imageOnLogin}
          imageOnDashboard={imageOnDashboard}
        />
      </div>
    </div>
  );
};
