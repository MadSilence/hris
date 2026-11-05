"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { BreadcrumbItem } from "@/components/modules/organization/modules/profile/modules/personalDocuments/types/personalDocuments.types";

type PersonalDocumentsBreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
};

export const PersonalDocumentsBreadcrumbs: React.FC<PersonalDocumentsBreadcrumbsProps> = ({
  items,
  onNavigate,
}) => {
  const t = useTranslations("organization");

  return (
    <div className="flex flex-wrap items-center gap-1 text-body">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.id ?? "root"}-${index}`}>
            <button
              type="button"
              disabled={isLast}
              onClick={() => !isLast && onNavigate(index)}
              className={
                isLast
                  ? "cursor-default font-medium text-primary"
                  : "text-tertiary transition-colors hover:text-primary"
              }
            >
              {/* The root is the tab itself, named in the reader's language; every other hop is a folder's name. */}
              {item.id === null ? t("documents.root") : item.name}
            </button>
            {!isLast && <Icon icon={ArrowRight01Icon} size="sm" className="text-tertiary" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
