"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { File01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { cn } from "@/lib/cn";
import { useHandbook } from "../hooks";

export type PickedPage = { pageId: string; title: string };

/**
 * "Link a handbook page" (CM05) and "Link to a page" ("/" menu, CM06): a searchable list of the handbook's pages,
 * by section. The list is the handbook as its editor reads it — published pages only, since a link to a draft
 * would lead readers nowhere.
 */
export const HandbookPagePicker: React.FC<{ onPick: (page: PickedPage) => void; excludeId?: string }> = ({ onPick, excludeId }) => {
  const t = useTranslations("hub");
  const handbook = useHandbook();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const needle = query.trim().toLocaleLowerCase();

  const rows = React.useMemo(
    () =>
      (handbook.data?.sections ?? []).flatMap((section) =>
        section.pages
          .filter((page) => page.id !== excludeId && (!needle || page.title.toLocaleLowerCase().includes(needle)))
          .map((page) => ({ page, section: section.name })),
      ),
    [handbook.data, needle, excludeId],
  );

  React.useEffect(() => setActive(0), [needle]);

  return (
    <div className="flex w-80 flex-col gap-1 p-1">
      <div className="relative">
        <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-tertiary" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, rows.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && rows[active]) {
              e.preventDefault();
              onPick({ pageId: rows[active].page.id, title: rows[active].page.title });
            }
          }}
          aria-label={t("editor.searchPages")}
          placeholder={t("editor.searchPages")}
          className="h-8 w-full rounded-control border border-field bg-card pr-2 pl-8 text-body outline-none focus:border-accent"
        />
      </div>
      <div role="listbox" aria-label={t("editor.linkPage")} className="max-h-64 overflow-y-auto">
        {handbook.isLoading && (
          <div className="flex justify-center py-4">
            <NodRing size="sm" />
          </div>
        )}
        {!handbook.isLoading && rows.length === 0 && <p className="px-2 py-3 text-body text-tertiary">{t("editor.noPages")}</p>}
        {rows.map(({ page, section }, index) => (
          <button
            key={page.id}
            type="button"
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => setActive(index)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick({ pageId: page.id, title: page.title })}
            className={cn(
              "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-body",
              index === active ? "bg-subtle" : "hover:bg-subtle",
            )}
          >
            <Icon icon={File01Icon} size="sm" className="shrink-0 text-tertiary" />
            <span className="min-w-0 flex-1 truncate text-primary">{page.title}</span>
            <span className="max-w-28 shrink-0 truncate text-hint text-tertiary">{section}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
