"use client";

import { useParams } from "next/navigation";
import { UserTimeOffCalendar } from "@/components/modules/calendar/components/UserTimeOffBalances/UserTimeOffCalendar";

export default function TimeOffPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="h-[72vh] w-full">
      <UserTimeOffCalendar userId={userId} />
    </div>
  );
}
