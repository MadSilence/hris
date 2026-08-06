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
import type { Office } from "@/models/office";

const BASE_PATH = "/offices";

export default function OfficeAssignedUsersTab({ office }: { office: Office }) {
  const [query, setQuery] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
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
        description="Everyone assigned to this office, managed in one place."
        manageResource="ORG.OFFICE"
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
          assignableId: office.id,
          assignableName: office.name,
          noun: "office",
          invalidateKeys: [assignedUsersQueryKey(BASE_PATH, office.id)],
        }}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${office.name}`}
        description="Export this office's details and its assigned users."
        includedText="Two sheets — General Information (name, description, email, phone, address, assigned people, created by, created at) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
}
