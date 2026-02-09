import { useMutation } from "@tanstack/react-query";
import type {
  CreateJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/createJobLevelGroupAction";
import {
  createJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/createJobLevelGroupAction";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";

export const useCreateJobLevelGroupAction = () => {
  const revalidateJobLevelGroupQuery = useInvalidateJobLevelGroupQuery();

  return useMutation({
    mutationFn: (payload: CreateJobLevelGroupActionInput) =>
      createJobLevelGroupAction(payload),
    onSuccess: () => {
      revalidateJobLevelGroupQuery();
    },
  });
};
