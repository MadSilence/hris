import { redirect } from "next/navigation";

// Time off policies now live under a leave type: /settings/time/leave-type/{id}/policies
export default function TimeOffPage() {
  redirect("/settings/time/leave-type");
}
