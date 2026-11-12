import { HubManageGate, SettingsContainer } from "@/components/modules/hub/manage";

/** CM04 needs MANAGE: who may post, reminders and celebrations are the company's settings. */
export default function HubManageSettingsPage() {
  return (
    <HubManageGate action="MANAGE">
      <SettingsContainer />
    </HubManageGate>
  );
}
