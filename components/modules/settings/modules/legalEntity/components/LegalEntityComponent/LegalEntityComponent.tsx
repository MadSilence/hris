"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateLegalEntityModal } from "../modals/CreateLegalEntityModal";
import type { CreateLegalEntityFormValues } from "../modals/CreateLegalEntityModal/CreateLegalEntityForm";
import { LegalEntity } from "@/models/legalEntity";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";
import type { CreateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  LegalEntitySettingsSkeleton
} from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent/LegalEntitySettingsSkeleton";

type Props = {
  initialEntities: LegalEntity[];
  isLoading: boolean;
};

export const LegalEntityComponent: React.FC<Props> = ({
  initialEntities,
  isLoading,
}) => {
  const [isCreateLegalEntityModalOpen, setIsCreateLegalEntityModalOpen] =
    useState(false);
  const [query, setQuery] = useState("");

  const createLegalEntityAction = useCreateLegalEntityAction();
  const router = useRouter();

  useEffect(() => {
    const status = createLegalEntityAction.data?.status;

    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateLegalEntityModalOpen(false);
    }
  }, [createLegalEntityAction.data?.status]);

  const handleRowClick = (row: LegalEntity) => {
    router.push(`/settings/general/legal-entities/${row.id}`);
  };

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

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = q
      ? initialEntities.filter((e) =>
        [
          e.name,
          e.country,
          e.city,
          e.street,
          e.registrationNumber,
          e.taxId,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      : initialEntities;

    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialEntities, query]);

  return (
    <>
      <div className="py-6">
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

          <Button onClick={() => setIsCreateLegalEntityModalOpen(true)}>
            Add
          </Button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <LegalEntitySettingsSkeleton/>
        ) : (
          <Table>
            <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Registration number</TableHead>
                <TableHead>Tax ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSorted.map((e) => (
                <TableRow
                  key={e.id}
                  className="group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2"
                  onClick={() => handleRowClick(e)}
                >
                  <TableCell className="py-3">{e.name}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.country}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {[e.street, e.postCode, e.city, e.country]
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.registrationNumber}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.taxId}
                  </TableCell>
                </TableRow>
              ))}

              {filteredSorted.length === 0 && (
                <TableRow className="[&_td]:py-3">
                  <TableCell colSpan={5}>
                    <div className="text-sm text-muted-foreground">
                      No legal entities
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateLegalEntityModal
        isOpen={isCreateLegalEntityModalOpen}
        isLoading={createLegalEntityAction.isPending}
        onConfirmAction={handleCreate}
        onCancelAction={() => setIsCreateLegalEntityModalOpen(false)}
      />
    </>
  );
};
