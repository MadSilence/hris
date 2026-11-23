"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Add01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SearchBox } from "@/components/ui/SearchBox";
import { explain } from "@/lib/feedback/explainToast";
import { HistoryToggle } from "@/components/audience/assignment/history/AssignmentHistory";

export interface AssignedUsersTableHeaderProps {
  query: string;
  onQueryChange: (v: string) => void;
  /** Why Assign cannot work (an archived role): said when it is pressed, never greyed (NEVER-DISABLED). The backend refuses these cases anyway (R00009). */
  cannotAssignReason?: string;
  onAssignClick?: () => void;
  onExportClick: () => void;
  /** Present to offer the history view of who held the role. */
  showHistory?: boolean;
  onShowHistoryChange?: (showing: boolean) => void;
}

export default function AssignedUsersTableHeader({
  query,
  onQueryChange,
  cannotAssignReason,
  onAssignClick,
  onExportClick,
  showHistory = false,
  onShowHistoryChange,
}: AssignedUsersTableHeaderProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  return (
    <div className="flex items-center justify-between gap-4">
      {showHistory ? <span/> : <SearchBox value={query} onChange={onQueryChange}/>}

      <div className="flex items-center gap-3">
        {onShowHistoryChange ? <HistoryToggle showing={showHistory} onChange={onShowHistoryChange}/> : null}
        {/* Assigning roles is gated by PEOPLE.PROFILE MANAGE on the backend, not ROLES.ROLE. */}
        <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
          <Button type="button"
            onClick={() => (cannotAssignReason ? explain(cannotAssignReason) : onAssignClick?.())}
            className="gap-1.5"
          >
            <Icon icon={Add01Icon} size="sm" />
            {t("roles.assigned.assign")}
          </Button>
        </PermissionGate>

        <Button type="button" size="icon" variant="secondary" onClick={onExportClick} aria-label={tCommon("actions.export")}>
          <Icon icon={Download01Icon} size="sm" />
        </Button>
      </div>
    </div>
  );
}
