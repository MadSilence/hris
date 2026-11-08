 "use server";
import { toActionError } from "@/lib/errors/withActionError";
 
 import { ActionStatus } from "@/components/models/ActionStatus";
 import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
 
 export const deleteRoleAction = async (
   submission: DeleteRoleActionInput
 ): Promise<DeleteRoleActionOutput> => {
   try {
     await hrisApiRolesService.deleteRole(submission.id);
     return { status: ActionStatus.SUCCESS };
   } catch (error) {
     return toActionError(error, "deleteRoleAction");
   }
 };
 
 export type DeleteRoleActionInput = {
   id: string;
 };
 
 export type DeleteRoleActionOutput = {
   status: ActionStatus;
   errorMessage?: string;
 };
