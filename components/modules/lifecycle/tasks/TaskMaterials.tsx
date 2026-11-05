"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Attachment01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { Material } from "@/models/lifecycle";

/**
 * HR's files and links on a task (DECISIONS.md § "Lifecycle tasks", B1). A link opens in a new tab; a file is
 * fetched by `onOpenFile`, because the two surfaces reach it differently — the app through its session, the
 * preboarding page through its token.
 */
export function TaskMaterials({ materials, onOpenFile }: {
  materials: Material[];
  onOpenFile: (material: Material) => void;
}) {
  const t = useTranslations("lifecycle");
  if (materials.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2" aria-label={t("materials.list")}>
      {materials.map((m, i) => (
        <li key={`${m.fileId ?? m.url}-${i}`}>
          {m.type === "LINK" && m.url ? (
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-tag border border-divider px-2 py-1 text-hint hover:bg-subtle"
            >
              <Icon icon={LinkSquare02Icon} size="sm" />
              {m.name ?? m.url}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onOpenFile(m)}
              className="inline-flex items-center gap-1 rounded-tag border border-divider px-2 py-1 text-hint hover:bg-subtle"
            >
              <Icon icon={Attachment01Icon} size="sm" />
              {m.name ?? t("shared.file")}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Saves a fetched file under its own name — the shape both surfaces end in. */
export const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
