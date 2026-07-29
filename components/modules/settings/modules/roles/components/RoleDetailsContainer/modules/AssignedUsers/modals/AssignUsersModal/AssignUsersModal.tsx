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
    noun="role"
    semantics="add"
    invalidateKeys={[rolesQueryKeys.roles()]}
  />
);
