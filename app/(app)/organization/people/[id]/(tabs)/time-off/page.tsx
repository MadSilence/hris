"use client";

import { useParams } from "next/navigation";
import { UserTimeOffCalendar } from "@/components/modules/calendar/components/UserTimeOffBalances/UserTimeOffCalendar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function TimeOffPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <PermissionGate resource="PEOPLE.TIME_OFF" action="VIEW" fallback={<AccessDenied/>}>
      <div className="h-[72vh] w-full">
        <UserTimeOffCalendar userId={userId}/>
      </div>
    </PermissionGate>
  );
}
