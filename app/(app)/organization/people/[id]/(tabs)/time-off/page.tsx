"use client";

import { useParams } from "next/navigation";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";

export default function TimeOffPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="max-h-[72vh] w-full overflow-auto pb-6">
      <UserCalendarContainer userId={userId} variant="compact" />
    </div>
  );
}
