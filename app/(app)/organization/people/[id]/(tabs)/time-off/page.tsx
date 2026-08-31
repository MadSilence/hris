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
      <div className="h-[72vh] w-full">
        <UserTimeOffCalendar userId={userId}/>
      </div>
    </ProfileCapabilityGate>
  );
}
