"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { BreadcrumbItem } from "@/components/modules/organization/modules/profile/modules/personalDocuments/types/personalDocuments.types";
import { FolderGlyph } from "../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

type PersonalDocumentsBreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
  /** The open folder's look, drawn as its icon tile before its name (T01, DT29); absent for the trash. */
  current?: { icon?: string | null; color?: string | null } | null;
  /** "4 files" after the trail (T01, T10). */
  count?: number;
};

/**
 * Inside a folder (documents-tab T01, DT29): "Documents" 18/26 grey › the folder's icon tile 28 and its name 18/26 600
 * in Ink, then "4 files". The trash opens the same way: Documents › Trash (T10).
 */
export const PersonalDocumentsBreadcrumbs: React.FC<PersonalDocumentsBreadcrumbsProps> = ({
  items,
  onNavigate,
  current,
  count,
}) => {
  const t = useTranslations("organization");

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        // The first hop is the tab itself, named in the reader's language; every other is its own name.
        const label = index === 0 ? t("documents.root") : item.name;

        return (
          <React.Fragment key={`${item.id ?? "root"}-${index}`}>
            {isLast ? (
              <span className="flex min-w-0 items-center gap-2">
                {current && (
                  <span className="grid size-7 flex-none place-items-center rounded-control bg-mist">
                    <FolderGlyph folder={current} />
                  </span>
                )}
                <span className="truncate text-section-title text-primary">{label}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(index)}
                className="text-section-title font-normal text-tertiary transition-colors hover:text-primary"
              >
                {label}
              </button>
            )}
            {!isLast && <Icon icon={ArrowRight01Icon} size="sm" className="text-tertiary" />}
          </React.Fragment>
        );
      })}
      {count !== undefined && (
        <span className="text-body text-tertiary">{t("documents.folderCard.files", { count })}</span>
      )}
    </div>
  );
};
