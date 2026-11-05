"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Attachment01Icon, Cancel01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { uploadLifecycleFileAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import type { Material } from "@/models/lifecycle";
import { FilePickButton } from "./FilePickButton";

const isWebAddress = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * HR's files and links on a task (DECISIONS.md § "Lifecycle tasks", B1) — what whoever does it is given to
 * read. A file is uploaded when it is picked and named by id from then on; a link must be a web address. An
 * acknowledgement needs at least one.
 */
export function MaterialsEditor({ idPrefix, materials, disabled, required, onChange }: {
  idPrefix: string;
  materials: Material[];
  disabled?: boolean;
  /** An acknowledgement: say that it needs one. */
  required?: boolean;
  onChange: (materials: Material[]) => void;
}) {
  const t = useTranslations("lifecycle");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLink = () => {
    const address = url.trim();
    if (!isWebAddress(address)) {
      setError(t("materials.linkInvalid"));
      return;
    }
    onChange([...materials, { type: "LINK", url: address, name: name.trim() || null }]);
    setUrl("");
    setName("");
    setError(null);
  };

  const addFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await uploadLifecycleFileAction(form);
      if (res.status === ActionStatus.SUCCESS && res.data) {
        onChange([...materials, { type: "FILE", fileId: res.data.id, name: res.data.name }]);
      } else {
        setError(res.errorMessage ?? t("materials.uploadFailed"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-medium">{required ? t("materials.legendRequired") : t("materials.legend")}</legend>
      <p className="text-hint text-tertiary">
        {required ? t("materials.hintRequired") : t("materials.hint")}
      </p>
      {materials.length > 0 && (
        <ul className="space-y-1">
          {materials.map((m, i) => (
            <li key={`${m.fileId ?? m.url}-${i}`} className="flex items-center gap-2 text-body">
              {m.type === "LINK" ? <Icon icon={LinkSquare02Icon} size="sm" className="shrink-0" /> : <Icon icon={Attachment01Icon} size="sm" className="shrink-0" />}
              <span className="min-w-0 flex-1 truncate">{m.name ?? m.url ?? t("shared.file")}</span>
              {!disabled && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label={t("materials.remove", { name: m.name ?? t("materials.material") })}
                  onClick={() => onChange(materials.filter((_, j) => j !== i))}>
                  <Icon icon={Cancel01Icon} size="sm" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-link`} className="text-hint">{t("materials.link")}</Label>
            <Input id={`${idPrefix}-link`} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} />
            <Input aria-label={t("materials.linkName")} placeholder={t("materials.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
            <Button type="button" size="sm" variant="secondary" disabled={busy || !url.trim()} onClick={addLink}>{t("materials.addLink")}</Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-file`} className="text-hint">{t("shared.file")}</Label>
            <FilePickButton id={`${idPrefix}-file`} label={t("materials.attachFile")} disabled={busy}
              onPickAction={(file) => { if (file) void addFile(file); }} />
          </div>
        </div>
      )}
      <FormError message={error} />
    </fieldset>
  );
}
