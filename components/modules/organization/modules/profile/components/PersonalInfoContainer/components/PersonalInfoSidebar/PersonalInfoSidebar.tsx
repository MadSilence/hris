import * as React from "react";
import { Button } from "@/public/desact/src/components/ui/button";

export type PersonalInfoSection = {
  id: string;
  name: string;
};

type Props = {
  sections: PersonalInfoSection[];
  activeId?: string | null;
  onSelect: (id: string) => void;
};

export const PersonalInfoSidebar: React.FC<Props> = ({ sections, activeId, onSelect }) => {
  return (
    <aside className="h-full min-h-0 overflow-y-auto py-1 pr-1">
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <Button
            key={section.id}
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => onSelect(section.id)}
          >
            <span className="leading-tight">{section.name}</span>
          </Button>
        );
      })}
    </aside>
  );
};
