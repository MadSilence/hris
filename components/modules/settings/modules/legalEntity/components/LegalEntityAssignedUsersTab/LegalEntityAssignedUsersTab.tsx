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
import type { LegalEntity } from "@/models/legalEntity";

const BASE_PATH = "/legal-entities";

export default function LegalEntityAssignedUsersTab({ entity }: { entity: LegalEntity }) {
  const t = useTranslations("structure.legalEntities");
  const tPlaces = useTranslations("structure.places");
  const [query, setQuery] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, limited, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, entity.id, q);

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(`/api/legal-entities/${entity.id}/export`, format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export legal entity:", error);
    }
  };

  return (
    <>
      <AssignedUsersPanel
        description={t("assigned.description")}
        manageResource="ORG.LEGAL_ENTITY"
        query={query}
        onQueryChange={setQuery}
        rows={items}
        total={total}
        limited={limited}
        isLoading={isLoading}
        error={error}
        isArchived={entity.archived}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
        onExport={() => setIsExportOpen(true)}
        assign={{
          basePath: BASE_PATH,
          assignableId: entity.id,
          assignableName: entity.name,
          kind: "legalEntity",
          invalidateKeys: [assignedUsersQueryKey(BASE_PATH, entity.id)],
        }}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={tPlaces("exportNamed", { name: entity.name })}
        description={t("details.exportDescription")}
        includedText={t("details.exportIncluded")}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
}
