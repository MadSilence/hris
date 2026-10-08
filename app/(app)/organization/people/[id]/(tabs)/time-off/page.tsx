"use client";

import { useParams } from "next/navigation";
import { UserTimeOffCalendar } from "@/components/modules/calendar/components/UserTimeOffBalances/UserTimeOffCalendar";
import {
  ProfileCapabilityGate,
} from "@/components/modules/organization/modules/profile/components/ProfileCapabilityGate";

export default function TimeOffPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <ProfileCapabilityGate userId={userId} resource="PEOPLE.TIME_OFF">
      {/* The same frame as the Attendance tab: the scroll lives here, since the profile shell clips. */}
      <div className="h-full w-full overflow-y-auto pb-2">
        <UserTimeOffCalendar userId={userId}/>
      </div>
    </ProfileCapabilityGate>
  );
}
