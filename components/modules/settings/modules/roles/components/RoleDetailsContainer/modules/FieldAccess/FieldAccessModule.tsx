import * as React from "react";
import FieldAccessContainer from "./FieldAccessContainer";

export default function FieldAccessModule({ roleId }: { roleId: string; isLoading?: boolean }) {
  return <FieldAccessContainer roleId={roleId}/>;
}
