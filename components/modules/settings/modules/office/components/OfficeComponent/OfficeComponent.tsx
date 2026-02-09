"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable/DataTable";
import { CreateOfficeModal } from "@/components/modules/settings/modules/office/components/CreateOfficeModal";
import type { CreateOfficeFormValues } from "@/components/modules/settings/modules/office/components/CreateOfficeForm";
import { OfficeDetailsModal } from "@/components/modules/settings/modules/office/components/OfficeDetailsModal";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import { useUpdateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useUpdateOfficeAction";
import { useDeleteOfficeAction } from "@/components/modules/settings/modules/office/hooks/useDeleteOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import type { UpdateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import type { DeleteOfficeActionInput } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { UpdateOfficeFormValues } from "@/components/modules/settings/modules/office/components/UpdateOfficeForm";

const columns: DataTableColumn<Office>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    icon: <span>Aa</span>,
    accessor: (o) => o.name,
    sortValue: (o) => o.name,
  },
  {
    id: "country",
    header: "Country",
    sortable: true,
    accessor: (o) => o.country,
    sortValue: (o) => o.country,
  },
  {
    id: "address",
    header: "Address",
    sortable: false,
    accessor: (o) =>
      `${o.street}, ${o.building}, ${o.postCode}, ${o.city}, ${o.country}`,
  },
  {
    id: "email",
    header: "Email",
    sortable: false,
    accessor: (o) => o.email ?? "",
  },
  {
    id: "phone",
    header: "Phone",
    sortable: false,
    accessor: (o) => o.phone ?? "",
  },
];

type Props = {
  initialOffices: Office[] | undefined;
};

export const OfficeComponent: React.FC<Props> = ({ initialOffices }) => {
  const [isCreateOfficeModalOpen, setIsCreateOfficeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  const createOfficeAction = useCreateOfficeAction();
  const updateOfficeAction = useUpdateOfficeAction();
  const deleteOfficeAction = useDeleteOfficeAction();

  const selectedOffice = useMemo(
    () => initialOffices.find((o) => o.id === selectedOfficeId) ?? null,
    [initialOffices, selectedOfficeId],
  );

  useEffect(() => {
    const status = createOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateOfficeModalOpen(false);
    }
  }, [createOfficeAction.data?.status]);

  useEffect(() => {
    const status = updateOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
    }
  }, [updateOfficeAction.data?.status]);

  useEffect(() => {
    const status = deleteOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
      setSelectedOfficeId(null);
    }
  }, [deleteOfficeAction.data?.status]);

  const handleCreate = (values: CreateOfficeFormValues) => {
    const payload: CreateOfficeActionInput = {
      name: values.name,
      description: values.description,
      email: values.email,
      phone: values.phone,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    createOfficeAction.mutate(payload);
  };

  const handleUpdate = (values: UpdateOfficeFormValues) => {
    if (!selectedOffice) return;

    const payload: UpdateOfficeActionInput = {
      id: selectedOffice.id,
      isSystem: selectedOffice.isSystem,
      name: values.name,
      description: values.description,
      email: values.email,
      phone: values.phone,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    updateOfficeAction.mutate(payload);
  };

  const handleDelete = () => {
    if (!selectedOffice) return;

    const payload: DeleteOfficeActionInput = { id: selectedOffice.id };
    deleteOfficeAction.mutate(payload);
  };

  const handleRowClick = (row: Office) => {
    setSelectedOfficeId(row.id);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <DataTable<Office>
        columns={columns}
        data={initialOffices}
        getRowId={(o) => o.id}
        onFilterClick={() => {
          console.log("Filter offices");
        }}
        onAddClick={() => setIsCreateOfficeModalOpen(true)}
        addLabel="Add"
        defaultSort={{ columnId: "name", direction: "asc" }}
        searchPlaceholder="Search offices"
        onRowClick={handleRowClick}
      />

      <CreateOfficeModal
        isOpen={isCreateOfficeModalOpen}
        isLoading={createOfficeAction.isPending}
        onConfirm={handleCreate}
        onRequestClose={() => setIsCreateOfficeModalOpen(false)}
      />

      {selectedOffice && (
        <OfficeDetailsModal
          isOpen={isDetailsModalOpen}
          isLoading={updateOfficeAction.isPending}
          isDeleteLoading={deleteOfficeAction.isPending}
          office={selectedOffice}
          onRequestClose={() => setIsDetailsModalOpen(false)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};
