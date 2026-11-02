"use client";

import React, { useState } from "react";
import { ExternalLink, Paperclip, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { uploadLifecycleFileAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import type { Material } from "@/models/lifecycle";

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
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLink = () => {
    const address = url.trim();
    if (!isWebAddress(address)) {
      setError("A link must be a web address, starting with https:// or http://.");
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
        setError(res.errorMessage ?? "The file could not be uploaded.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Material{required ? " *" : ""}</legend>
      <p className="text-xs text-muted-foreground">
        {required
          ? "What the person confirms they have read: a file or a link."
          : "Files and links for whoever does the task."}
      </p>
      {materials.length > 0 && (
        <ul className="space-y-1">
          {materials.map((m, i) => (
            <li key={`${m.fileId ?? m.url}-${i}`} className="flex items-center gap-2 text-sm">
              {m.type === "LINK" ? <ExternalLink className="h-3.5 w-3.5 shrink-0" /> : <Paperclip className="h-3.5 w-3.5 shrink-0" />}
              <span className="min-w-0 flex-1 truncate">{m.name ?? m.url ?? "File"}</span>
              {!disabled && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label={`Remove ${m.name ?? "material"}`}
                  onClick={() => onChange(materials.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <div className="space-y-2 rounded-md border border-brown-200 p-2">
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-link`} className="text-xs">Link</Label>
            <Input id={`${idPrefix}-link`} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} />
            <Input aria-label="Link name" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
            <Button type="button" size="sm" variant="outline" disabled={busy || !url.trim()} onClick={addLink}>Add Link</Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-file`} className="text-xs">File</Label>
            <Input id={`${idPrefix}-file`} type="file" disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void addFile(file);
              }} />
          </div>
        </div>
      )}
      <FormError message={error} />
    </fieldset>
  );
}
