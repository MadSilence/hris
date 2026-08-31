import * as React from "react";

export type PersonalInfoSection = {
  id: string;
  name: string;
};

type Props = {
  sections: PersonalInfoSection[];
  activeId?: string | null;
  onSelect: (id: string) => void;
};

/**
 * The profile's block navigation.
 *
 * It used to be a stack of full-width buttons, which read as a toolbar rather than a place you are
 * in: every entry looked equally loud and the active one was told apart by a fill alone. Now it is
 * a quiet list with one accent — the marker on the section you are reading — so the eye finds
 * "where am I" before it reads any label.
 */
export const PersonalInfoSidebar: React.FC<Props> = ({ sections, activeId, onSelect }) => {
  return (
    <aside className="h-full min-h-0 overflow-y-auto py-1 pr-1">
      <nav className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "group relative flex w-full items-center gap-2 rounded-lg py-2 pl-4 pr-3 text-left",
                "text-sm transition-colors",
                isActive
                  ? "bg-brown-50 font-medium text-brown-800"
                  : "text-muted-foreground hover:bg-brown-50/60 hover:text-foreground",
              ].join(" ")}
            >
              {/* The marker, not a border: a border would shift the label by a pixel on select. */}
              <span
                aria-hidden
                className={[
                  "absolute left-1 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full transition-colors",
                  isActive ? "bg-brown-600" : "bg-transparent",
                ].join(" ")}
              />

              <span className="min-w-0 flex-1 truncate leading-tight">{section.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
