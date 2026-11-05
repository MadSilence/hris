"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useAssignedUsers,
  assignedUsersQueryKey,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import AssignedUsersPanel from "@/components/modules/settings/shared/AssignedUsersPanel/AssignedUsersPanel";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import type { Office } from "@/models/office";

const BASE_PATH = "/offices";

export default function OfficeAssignedUsersTab({ office }: { office: Office }) {
  const t = useTranslations("structure.offices");
  const tPlaces = useTranslations("structure.places");
  const [query, setQuery] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, limited, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, office.id, q);

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(`/api/offices/${office.id}/export`, format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export office:", error);
    }
  };

  return (
    <>
      <AssignedUsersPanel
        description={t("assigned.description")}
        manageResource="ORG.OFFICE"
        query={query}
        onQueryChange={setQuery}
        rows={items}
        total={total}
        limited={limited}
        isLoading={isLoading}
        error={error}
        isArchived={office.archived}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
        onExport={() => setIsExportOpen(true)}
        assign={{
          basePath: BASE_PATH,
          assignableId: office.id,
          assignableName: office.name,
          kind: "office",
          invalidateKeys: [assignedUsersQueryKey(BASE_PATH, office.id)],
        }}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={tPlaces("exportNamed", { name: office.name })}
        description={t("details.exportDescription")}
        includedText={t("details.exportIncluded")}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
}
