"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export type AssignedUsersStrategy = "KEEP" | "UNASSIGN";

export type ArchiveLegalEntityActionInput = {
  id: string;
  assignedUsersStrategy: AssignedUsersStrategy;
};

export type ArchiveLegalEntityActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const archiveLegalEntityAction = async (
  { id, assignedUsersStrategy }: ArchiveLegalEntityActionInput
): Promise<ArchiveLegalEntityActionOutput> => {
  try {
    await legalEntityService.archiveLegalEntity(id, assignedUsersStrategy);
    return { status: ActionStatus.SUCCESS };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the legal entity. Please try again.",
    };
  }
};

export const restoreLegalEntityAction = async (
  { id }: { id: string }
): Promise<ArchiveLegalEntityActionOutput> => {
  try {
    await legalEntityService.restoreLegalEntity(id);
    return { status: ActionStatus.SUCCESS };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while restoring the legal entity. Please try again.",
    };
  }
};
