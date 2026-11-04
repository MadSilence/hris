"use client";

import React, { useRef } from "react";
import { Attachment01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";

/**
 * Choosing a file, as a button and the chosen name beside it. The browser's own file input draws its
 * "Choose File · No file chosen" in its own font and baseline, which sat crooked in every form it was put in
 * (owner, 2026-11-02); the input stays, hidden, and does the picking.
 */
export function FilePickButton({ id, label = "Choose file", file, disabled, onPickAction }: {
  id?: string;
  label?: string;
  /** The file picked so far; its name is shown, or "No file chosen". Omit where the pick is acted on at once. */
  file?: File | null;
  disabled?: boolean;
  onPickAction: (file: File | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <input
        ref={input}
        id={id}
        type="file"
        className="sr-only"
        aria-label={label}
        disabled={disabled}
        onChange={(e) => {
          onPickAction(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="secondary" size="sm" className="shrink-0 gap-1.5" disabled={disabled}
        onClick={() => input.current?.click()}>
        <Icon icon={Attachment01Icon} size="sm" />
        {label}
      </Button>
      {file !== undefined && (
        <span className="min-w-0 truncate text-body text-tertiary">{file ? file.name : "No file chosen"}</span>
      )}
    </div>
  );
}
