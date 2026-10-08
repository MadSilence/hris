import { Suspense } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { AttendancePersonContainer } from "@/components/modules/attendance/person";

type Props = { params: Promise<{ userId: string }> };

/** One person's log for a period, opened from the Attendance overview. Read-only, like the overview. */
export default async function AttendancePersonPage({ params }: Props) {
  const { userId } = await params;
  return (
    <PageGate resource="PEOPLE.ATTENDANCE" action="MANAGE">
      <Suspense fallback={null}>
        <AttendancePersonContainer userId={userId}/>
      </Suspense>
    </PageGate>
  );
}
