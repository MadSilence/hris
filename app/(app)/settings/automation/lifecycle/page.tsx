import { redirect } from "next/navigation";

/** The address "Preboarding & Onboarding" had before each process became its own tab. */
export default function LifecycleSettingsPage() {
  redirect("/settings/automation/preboarding");
}
