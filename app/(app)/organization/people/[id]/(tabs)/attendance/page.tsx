"use client";

import { useParams } from "next/navigation";
import { PersonAttendanceTab } from "@/components/modules/attendance/profile";
import {
  ProfileCapabilityGate,
} from "@/components/modules/organization/modules/profile/components/ProfileCapabilityGate";

export default function AttendanceTabPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <ProfileCapabilityGate userId={userId} resource="PEOPLE.ATTENDANCE">
      {/* The tab is taller than the shell's viewport now that a table sits under the calendar, so the
          scroll lives here rather than on the page, which the profile shell clips. */}
      <div className="h-full w-full overflow-y-auto pb-2">
        <PersonAttendanceTab userId={userId}/>
      </div>
    </ProfileCapabilityGate>
  );
}
