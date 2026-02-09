import { useMutation } from "@tanstack/react-query";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";
import type {
  DeleteJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";
import {
  deleteJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";

export const useDeleteJobLevelGroupAction = () => {
  const revalidateJobLevelGroupQuery = useInvalidateJobLevelGroupQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobLevelGroupActionInput) =>
      deleteJobLevelGroupAction(payload),
    onSuccess: () => {
      revalidateJobLevelGroupQuery();
    },
  });
};
