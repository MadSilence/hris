"use client";

import * as React from "react";
import { PeoplePicker } from "@/components/modules/automations/settings";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import type { HubAudience } from "@/models/hub";
import { fromRecipients, toRecipients } from "./audienceDraft";

/**
 * People and roles in one field — the automations' people picker with roles (CM04, CM07: "Role: Team lead"). Only
 * the company's roles are offered: the hub's audience has no "their manager", it is a list.
 */
export const HubPeopleField: React.FC<{
  value: Pick<HubAudience, "userIds" | "roleIds">;
  onChange: (next: Pick<HubAudience, "userIds" | "roleIds">) => void;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  /** Roles only where a role can be chosen (CM04 lists roles as well as people; both are allowed). */
  withRoles?: boolean;
  /** One person (a page's owner) instead of a list. */
  single?: boolean;
}> = ({ value, onChange, ariaLabel, id, disabled, withRoles = true, single = false }) => {
  const roles = useRoles({ enabled: withRoles });
  const catalog = React.useMemo(
    () => ({
      recipientKinds: withRoles ? (["ROLE"] as const).slice() : [],
      roles: (roles.data ?? []).filter((r) => !r.archived).map((r) => ({ id: r.id, name: r.name })),
    }),
    [roles.data, withRoles],
  );
  return (
    <PeoplePicker
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      mode={single ? "single" : "multiple"}
      catalog={catalog}
      value={toRecipients(value)}
      onChange={(next) => onChange(fromRecipients(next))}
    />
  );
};
