import { useMutation } from "@tanstack/react-query";
import type {
  UpdateJobLevelItemActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import { updateJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";

export const useUpdateJobLevelItemAction = () => {
  const revalidateJobLevelItemQuery = useInvalidateJobLevelItemQuery();

  return useMutation({
    mutationFn: (payload: UpdateJobLevelItemActionInput) =>
      updateJobLevelItemAction(payload),
    onSuccess: () => {
      revalidateJobLevelItemQuery();
    },
  });
};
