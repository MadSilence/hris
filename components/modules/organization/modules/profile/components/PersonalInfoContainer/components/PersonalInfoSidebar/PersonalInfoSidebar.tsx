import * as React from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Button } from "@/public/desact/src/components/ui/button";

type Props = {
  groups: AttributeGroup[];
  activeId?: string | null;
  onSelect: (id: string) => void;
};

export const PersonalInfoSidebar: React.FC<Props> = ({ groups, activeId, onSelect }) => {
  return (
    <aside className="sticky top-0 self-start h-[calc(100vh-4rem)] overflow-hidden">
      <div className="p-4 overflow-y-auto h-full">
        {groups.map((g) => {
          const isActive = g.id === activeId;
          return (
            <Button
              key={g.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => onSelect(g.id)}
            >
              <span className="leading-tight">{g.name}</span>
            </Button>
          );
        })}
      </div>
    </aside>
  );
};
