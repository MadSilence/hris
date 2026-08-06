"use client";

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
  const [query, setQuery] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
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
        description="Everyone assigned to this legal entity, managed in one place."
        manageResource="ORG.LEGAL_ENTITY"
        query={query}
        onQueryChange={setQuery}
        rows={items}
        total={total}
        isLoading={isLoading}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
        onExport={() => setIsExportOpen(true)}
        assign={{
          basePath: BASE_PATH,
          assignableId: entity.id,
          assignableName: entity.name,
          noun: "legal entity",
          invalidateKeys: [assignedUsersQueryKey(BASE_PATH, entity.id)],
        }}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${entity.name}`}
        description="Export this legal entity's details and its assigned users."
        includedText="Two sheets — General Information (name, description, registration number, tax ID, address, assigned people, created by, created at) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
}
