"use client";

import React from "react";
import Link from "next/link";
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
          {m.type === "LINK" && m.url && isInAppPath(m.url) ? (
            // A path inside the app — the hub's onboarding task links its must-read pages this way (CH6).
            <Link
              href={m.url}
              className="inline-flex items-center gap-1 rounded-tag border border-divider px-2 py-1 text-hint no-underline hover:bg-subtle"
            >
              <Icon icon={LinkSquare02Icon} size="sm" />
              {m.name ?? m.url}
            </Link>
          ) : m.type === "LINK" && m.url ? (
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

/** A relative path inside the app ("/hub/handbook/…"), opened in place; never "//host", which leaves the app. */
export const isInAppPath = (url: string): boolean => url.startsWith("/") && !url.startsWith("//");

/** Saves a fetched file under its own name — the shape both surfaces end in. */
export const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
