import { useMutation } from "@tanstack/react-query";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";
import type {
  UpdateJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";
import {
  updateJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";

export const useUpdateJobLevelGroupAction = () => {
  const revalidateJobLevelGroupQuery = useInvalidateJobLevelGroupQuery();

  return useMutation({
    mutationFn: (payload: UpdateJobLevelGroupActionInput) =>
      updateJobLevelGroupAction(payload),
    onSuccess: () => {
      revalidateJobLevelGroupQuery();
    },
  });
};
