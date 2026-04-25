 "use server";
 
 import { ActionStatus } from "@/components/models/ActionStatus";
 import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
 
 export const deleteRoleAction = async (
   submission: DeleteRoleActionInput
 ): Promise<DeleteRoleActionOutput> => {
   try {
     await hrisApiRolesService.deleteRole(submission.id);
     return { status: ActionStatus.SUCCESS };
   } catch {
     return {
       status: ActionStatus.ERROR,
       errorMessage: "An error occurred while deleting role. Please try again.",
     };
   }
 };
 
 export type DeleteRoleActionInput = {
   id: string;
 };
 
 export type DeleteRoleActionOutput = {
   status: ActionStatus;
   errorMessage?: string;
 };
