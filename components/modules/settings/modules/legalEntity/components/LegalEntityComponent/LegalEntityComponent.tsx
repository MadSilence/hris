"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CreateLegalEntityModal } from "../CreateLegalEntityModal";
import type { CreateLegalEntityFormValues } from "../CreateLegalEntityForm";
import { LegalEntity } from "@/models/legalEntity";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";
import { useUpdateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useUpdateLegalEntityAction";
import { useDeleteLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useDeleteLegalEntityAction";
import type { CreateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import type { UpdateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import type { DeleteLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdateLegalEntityFormValues } from "@/components/modules/settings/modules/legalEntity/components/UpdateLegalEntityForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { LegalEntityDetailsModal } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsModal";

type Props = {
  initialEntities: LegalEntity[];
  isLoading: boolean;
};

export const LegalEntityComponent: React.FC<Props> = ({ initialEntities, isLoading }) => {
  const [isCreateLegalEntityModalOpen, setIsCreateLegalEntityModalOpen] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? initialEntities.filter((e) =>
        [e.name, e.country, e.city, e.street, e.registrationNumber, e.taxId]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      : initialEntities;
    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialEntities, query]);

  const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`le-skel-${i}`} className="border-brown-200">
          <TableCell className="py-3"><Skeleton className="h-4 w-40"/></TableCell>
          <TableCell><Skeleton className="h-4 w-24"/></TableCell>
          <TableCell><Skeleton className="h-4 w-64"/></TableCell>
          <TableCell><Skeleton className="h-4 w-28"/></TableCell>
          <TableCell><Skeleton className="h-4 w-24"/></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <>
      <div className="p-6 border-b border-brown-200">
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Input
              placeholder="Search legal entities"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="w-[260px]"
              inputMode="search"
            />
          </div>
          <Button onClick={() => setIsCreateLegalEntityModalOpen(true)}>Add</Button>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader className="[&_tr]:border-brown-200">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Registration number</TableHead>
              <TableHead>Tax ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <SkeletonRows rows={6}/>}

            {!isLoading &&
              filteredSorted.map((e) => (
                <TableRow
                  key={e.id}
                  className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
                  onClick={() => handleRowClick(e)}
                >
                  <TableCell className="py-3 font-medium">{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.country}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[e.street, e.postCode, e.city, e.country].filter(Boolean).join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.registrationNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{e.taxId}</TableCell>
                </TableRow>
              ))}

            {!isLoading && filteredSorted.length === 0 && (
              <TableRow className="[&_td]:py-3">
                <TableCell colSpan={5}>
                  <div className="text-sm text-muted-foreground">No legal entities</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateLegalEntityModal
        isOpen={isCreateLegalEntityModalOpen}
        isLoading={createLegalEntityAction.isPending}
        onConfirmAction={handleCreate}
        onCancelAction={() => setIsCreateLegalEntityModalOpen(false)}
      />

      {selectedEntity && (
        <LegalEntityDetailsModal
          isOpen={isDetailsModalOpen}
          isLoading={updateLegalEntityAction.isPending}
          isDeleteLoading={deleteLegalEntityAction.isPending}
          entity={selectedEntity}
          onCancelAction={() => setIsDetailsModalOpen(false)}
          onSaveAction={handleUpdate}
          onDeleteAction={handleDelete}
        />
      )}
    </>
  );
};
