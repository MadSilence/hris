import * as React from "react";
import RolePermissionsContainer from "./RolePermissionsContainer";

export default function PermissionsModule({ roleId }: { roleId: string; isLoading?: boolean }) {
  return <RolePermissionsContainer roleId={roleId}/>;
}
