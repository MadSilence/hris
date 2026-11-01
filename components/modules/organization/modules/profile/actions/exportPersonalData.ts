import { internalApiClient } from "@/components/clients/apiClient";
import { saveResponse } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import { withStepUp } from "@/components/modules/mfa/stepUp";

/**
 * Downloads everything the company holds about a person (GDPR Art. 15/20, P17). Asks "confirm it is you"
 * first — the whole person in one file — then saves the ZIP under Java's name.
 */
export const exportPersonalData = async (userId: string): Promise<void> => {
  const response = await withStepUp(() =>
    internalApiClient.fetch(`/users/${encodeURIComponent(userId)}/personal-data-export`, { method: "POST" }),
  );
  await saveResponse(response, "personal-data.zip");
};
