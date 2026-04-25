 "use server";
 
 import { ActionStatus } from "@/components/models/ActionStatus";
 import { UpdatedEntity } from "@/models/misc";
 import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
 
 export const renameRoleAction = async (
   submission: RenameRoleActionInput
 ): Promise<RenameRoleActionOutput> => {
   try {
     const data = await hrisApiRolesService.updateRoleName(submission.id, { name: submission.name });
 
     return {
       status: ActionStatus.SUCCESS,
       data,
     };
   } catch {
     return {
       status: ActionStatus.ERROR,
       errorMessage: "An error occurred while renaming role. Please try again.",
     };
   }
 };
 
 export type RenameRoleActionInput = {
   id: string;
   name: string;
 };
 
 export type RenameRoleActionOutput = {
   status: ActionStatus;
   data?: UpdatedEntity;
   errorMessage?: string;
 };
