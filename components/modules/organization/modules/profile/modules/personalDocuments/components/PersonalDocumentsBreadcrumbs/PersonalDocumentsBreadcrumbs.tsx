import * as React from "react";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "../../types/personalDocuments.types";

type PersonalDocumentsBreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
};

export const PersonalDocumentsBreadcrumbs: React.FC<PersonalDocumentsBreadcrumbsProps> = ({
  items,
  onNavigate,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
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
                  ? "cursor-default font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {item.name}
            </button>
            {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
          </React.Fragment>
        );
      })}
    </div>
  );
};
