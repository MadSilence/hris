"use client";

import * as React from "react";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";

export interface AssignUsersModalProps {
  isOpen: boolean;
  roleId: string;
  roleName?: string;
  onCloseAction: () => void;
}

export const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  isOpen,
  roleId,
  roleName,
  onCloseAction,
}) => (
  <AssignPeopleModal
    isOpen={isOpen}
    onCloseAction={onCloseAction}
    basePath="/roles"
    assignableId={roleId}
    assignableName={roleName}
    kind="role"
    semantics="add"
    // A role granted for a while — "access for two weeks" (ENTERPRISE_ACCESS_DESIGN.md § 4.6): the engine
    // ends it the day after the last date.
    temporal
    invalidateKeys={[rolesQueryKeys.roles()]}
  />
);
