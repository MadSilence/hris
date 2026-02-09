"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable/DataTable";
import { CreateLegalEntityModal } from "../CreateLegalEntityModal";
import type { CreateLegalEntityFormValues } from "../CreateLegalEntityForm";
import { LegalEntityDetailsModal } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsModal";
import { LegalEntity } from "@/models/legalEntity";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";
import { useUpdateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useUpdateLegalEntityAction";
import { useDeleteLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useDeleteLegalEntityAction";
import type { CreateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import type { UpdateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import type { DeleteLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdateLegalEntityFormValues } from "@/components/modules/settings/modules/legalEntity/components/UpdateLegalEntityForm";

const columns: DataTableColumn<LegalEntity>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    icon: <span>Aa</span>,
    accessor: (e) => e.name,
    sortValue: (e) => e.name,
  },
  {
    id: "country",
    header: "Country",
    sortable: true,
    accessor: (e) => e.country,
    sortValue: (e) => e.country,
  },
  {
    id: "address",
    header: "Address",
    sortable: false,
    accessor: (e) =>
      `${e.street}, ${e.postCode}, ${e.city}, ${e.country}`,
  },
  {
    id: "registrationNumber",
    header: "Registration number",
    sortable: false,
    accessor: (e) => e.registrationNumber,
  },
  {
    id: "taxId",
    header: "Tax ID",
    sortable: false,
    accessor: (e) => e.taxId,
  },
];

type Props = {
  initialEntities: LegalEntity[] | undefined;
};

export const LegalEntityComponent: React.FC<Props> = ({ initialEntities }) => {
  const [isCreateLegalEntityModalOpen, setIsCreateLegalEntityModalOpen] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const createLegalEntityAction = useCreateLegalEntityAction();
  const updateLegalEntityAction = useUpdateLegalEntityAction();
  const deleteLegalEntityAction = useDeleteLegalEntityAction();

  const selectedEntity = useMemo(
    () => initialEntities.find((e) => e.id === selectedEntityId) ?? null,
    [initialEntities, selectedEntityId],
  );

  useEffect(() => {
    const status = createLegalEntityAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateLegalEntityModalOpen(false);
    }
  }, [createLegalEntityAction.data?.status]);

  useEffect(() => {
    const status = updateLegalEntityAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
    }
  }, [updateLegalEntityAction.data?.status]);

  useEffect(() => {
    const status = deleteLegalEntityAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
      setSelectedEntityId(null);
    }
  }, [deleteLegalEntityAction.data?.status]);

  const handleCreate = (values: CreateLegalEntityFormValues) => {
    const payload: CreateLegalEntityActionInput = {
      name: values.name,
      description: values.description,
      registrationNumber: values.registrationNumber,
      taxId: values.taxId,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    createLegalEntityAction.mutate(payload);
  };

  const handleUpdate = (values: UpdateLegalEntityFormValues) => {
    if (!selectedEntity) return;

    const payload: UpdateLegalEntityActionInput = {
      id: selectedEntity.id,
      isSystem: selectedEntity.isSystem,
      name: values.name,
      description: values.description,
      registrationNumber: values.registrationNumber,
      taxId: values.taxId,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    updateLegalEntityAction.mutate(payload);
  };

  const handleDelete = () => {
    if (!selectedEntity) return;

    const payload: DeleteLegalEntityActionInput = { id: selectedEntity.id };
    deleteLegalEntityAction.mutate(payload);
  };

  const handleRowClick = (row: LegalEntity) => {
    setSelectedEntityId(row.id);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <DataTable<LegalEntity>
        columns={columns}
        data={initialEntities}
        getRowId={(e) => e.id}
        onFilterClick={() => {
          console.log("Filter legal entities");
        }}
        onAddClick={() => setIsCreateLegalEntityModalOpen(true)}
        addLabel="Add"
        defaultSort={{ columnId: "name", direction: "asc" }}
        searchPlaceholder="Search legal entities"
        onRowClick={handleRowClick}
      />

      <CreateLegalEntityModal
        isOpen={isCreateLegalEntityModalOpen}
        isLoading={createLegalEntityAction.isPending}
        onConfirm={handleCreate}
        onRequestClose={() => setIsCreateLegalEntityModalOpen(false)}
      />

      {selectedEntity && (
        <LegalEntityDetailsModal
          isOpen={isDetailsModalOpen}
          isLoading={updateLegalEntityAction.isPending}
          isDeleteLoading={deleteLegalEntityAction.isPending}
          entity={selectedEntity}
          onRequestClose={() => setIsDetailsModalOpen(false)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};
