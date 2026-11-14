"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Banner } from "@/components/desact/alert";
import { Icon } from "@/components/desact/icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AuthBack } from "@/components/modules/auth/layout";
import { accentAttributes, accentHex } from "@/lib/theme/accent";
import type { CompanyAppearance, CompanyBackground } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import {
  accentToSave,
  autoLight,
  customOf,
  sameAccent,
  startingBackground,
} from "@/components/modules/settings/modules/general/companyAppearance/appearanceDraft";
import { isConflict } from "@/components/modules/settings/modules/general/companyAppearance/hooks/useCompanyAppearance";
import { ColorRings } from "@/components/modules/settings/modules/general/companyAppearance/components/ColorRings";
import { LogoDropZone } from "@/components/modules/settings/modules/general/companyAppearance/components/LogoDropZone";
import { AppearanceStage } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearanceStage";

type Props = {
  appearance: CompanyAppearance;
  companyName: string;
  logoUrl: string | null;
  /** The company's address, for the previews' browser bar. */
  address: string;
  /** SETTINGS.GENERAL EDIT: without it the page is view only (the stage still works). */
  canEdit: boolean;
  /** SETTINGS.GENERAL MANAGE: the logo's own right, as on its endpoints. */
  canChangeLogo: boolean;
  onSave: (body: UpdateCompanyAppearanceRequest) => Promise<CompanyAppearance | undefined>;
  saving: boolean;
  saveError: unknown;
  /** Resolves when the logo is in; rejects with the refusal. */
  onUploadLogo: (file: File) => Promise<void>;
  onRemoveLogo: () => Promise<void>;
  uploadingLogo: string | null;
  logoRefused: boolean;
};

/**
 * Settings → General → Appearance (sign-in-appearance): half landing, half settings. Left, the three steps and Save
 * pinned to the column's foot; right, the stage that shows the real result before Save. Picking repaints the stage,
 * the heading's second line and Save; the rest of the page keeps the saved colour until Save.
 */
export function AppearancePage({
  appearance,
  companyName,
  logoUrl,
  address,
  canEdit,
  canChangeLogo,
  onSave,
  saving,
  saveError,
  onUploadLogo,
  onRemoveLogo,
  uploadingLogo,
  logoRefused,
}: Props) {
  const t = useTranslations("settings.appearance");

  const [accent, setAccentState] = React.useState<string | null>(appearance.accent);
  const [background, setBackgroundState] = React.useState<CompanyBackground>(() => startingBackground(appearance));
  /** The background goes with the save once somebody chose it, or once auto-Light put it into the draft. */
  const [backgroundInDraft, setBackgroundInDraft] = React.useState(() => autoLight(appearance));
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [codeInvalid, setCodeInvalid] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const dirty = !sameAccent(accent, appearance.accent) || background !== appearance.background;

  // The version the page was opened with, sent back on Save so a colleague's save in between is refused (E00409).
  // It follows the latest read only while the page is clean; after this page's own save it holds what that produced.
  const [version, setVersion] = React.useState(appearance.version);
  React.useEffect(() => {
    if (!dirty) setVersion(appearance.version);
  }, [dirty, appearance.version]);

  // Auto-Light: a logo uploaded here that turns out to have two or three colours, in a company that never chose its
  // background, puts Light into the draft — unless somebody has picked a background on this page already.
  const logoColorsKey = appearance.logoColors.join(",");
  const backgroundTouched = React.useRef(false);
  React.useEffect(() => {
    if (!backgroundTouched.current && autoLight(appearance)) {
      setBackgroundState("LIGHT");
      setBackgroundInDraft(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new set of logo colours re-offers it
  }, [logoColorsKey]);

  const setAccent = (next: string) => {
    setAccentState(next);
    setJustSaved(false);
  };
  const setBackground = (next: CompanyBackground) => {
    backgroundTouched.current = true;
    setBackgroundState(next);
    setBackgroundInDraft(true);
    setJustSaved(false);
  };

  const save = async () => {
    if (codeInvalid) {
      setPickerOpen(true);
      return;
    }
    if (!dirty) return;
    const saved = await onSave({
      accent: accentToSave(accent),
      ...(backgroundInDraft ? { background } : {}),
      version,
    }).catch(() => undefined);
    if (!saved) return;
    if (saved.version !== undefined) setVersion(saved.version);
    setBackgroundInDraft(false);
    backgroundTouched.current = false;
    setJustSaved(true);
  };

  const upload = async (file: File) => {
    try {
      await onUploadLogo(file);
      setFileName(file.name);
    } catch {
      // The refusal is shown by the drop zone, anything else by the card — both from the container.
    }
  };

  const tried = accentHex(accent);
  const saveIsland = accentAttributes(accent);

  const status = (() => {
    if (saving) return <span className="text-secondary">{t("status.saving")}</span>;
    if (saveError && dirty) {
      return (
        <span role="alert" className="flex items-start gap-1.5 text-status-declined-text">
          <Icon icon={Alert02Icon} size="sm" className="mt-px shrink-0" />
          <span>
            {isConflict(saveError)
              ? t.rich("status.conflict", {
                  reload: (chunks) => (
                    <button type="button" className="underline underline-offset-4" onClick={() => window.location.reload()}>
                      {chunks}
                    </button>
                  ),
                })
              : t("status.failed")}
          </span>
        </span>
      );
    }
    if (dirty) return <span className="text-secondary">{t("status.dirty")}</span>;
    if (justSaved) return <span className="text-secondary">{t("status.justSaved", { company: companyName })}</span>;
    return <span className="text-tertiary">{t("status.saved")}</span>;
  })();

  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-0 gap-14 pl-12">
      <div className="flex w-[420px] shrink-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto pb-2">
          <div className="flex flex-col gap-4">
            <AuthBack href="/settings" />
            <h1 className="appearance-heading text-primary" style={{ "--appearance-tried": tried } as React.CSSProperties}>
              {t.rich("heading", { company: companyName, br: () => <br />, em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="m-0 text-auth-lead text-secondary">{t("lead")}</p>
          </div>

          {!canEdit ? <Banner>{t("readOnly")}</Banner> : null}

          <Step number={1} title={t("steps.logo")}>
            <LogoDropZone
              companyName={companyName}
              logoUrl={logoUrl}
              fileName={fileName}
              uploading={uploadingLogo}
              refused={logoRefused}
              readOnly={!canChangeLogo}
              onFile={(file) => void upload(file)}
              onRemove={() => {
                setFileName(null);
                void onRemoveLogo().catch(() => undefined);
              }}
            />
          </Step>

          <Step number={2} title={t("steps.color")}>
            <ColorRings
              value={accent}
              onChange={setAccent}
              logoColors={appearance.logoColors}
              ownStart={customOf(accent) ?? tried.toLowerCase()}
              pickerOpen={pickerOpen}
              onPickerOpenChange={setPickerOpen}
              codeInvalid={codeInvalid}
              onCodeInvalidChange={setCodeInvalid}
              disabled={!canEdit}
            />
          </Step>

          <div className="flex items-center justify-between gap-4">
            <StepTitle number={3} title={t("steps.background")} />
            <SegmentedControl<CompanyBackground>
              aria-label={t("background.label")}
              value={background}
              onChange={setBackground}
              disabled={!canEdit}
              fill={false}
              className="h-9 rounded-pill p-[3px] [&_button]:rounded-pill [&_button]:px-4"
              options={[
                { value: "COLOR", label: t("background.color") },
                { value: "LIGHT", label: t("background.light") },
              ]}
            />
          </div>
        </div>

        {canEdit ? (
          <div className="flex items-center gap-4 border-t border-divider pb-8 pt-6">
            <span data-theme="light" data-accent={saveIsland["data-accent"]} style={saveIsland.style as React.CSSProperties | undefined} className="inline-flex">
              <Button type="button" size="lg" onClick={() => void save()} loading={saving} loadingLabel={t("status.saving")}>
                {t("save")}
              </Button>
            </span>
            <p className="m-0 text-label font-normal" aria-live="polite">{status}</p>
          </div>
        ) : null}
      </div>

      <AppearanceStage
        accent={accent}
        draft={dirty}
        address={address}
        companyName={companyName}
        logoUrl={logoUrl}
        background={background}
        logoColors={appearance.logoColors}
      />
    </div>
  );
}

function StepTitle({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="m-0 flex items-center gap-2.5 text-card-title text-primary">
      <span className="appearance-step-number" aria-hidden>{number}</span>
      {title}
    </h2>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <StepTitle number={number} title={title} />
      {children}
    </section>
  );
}
