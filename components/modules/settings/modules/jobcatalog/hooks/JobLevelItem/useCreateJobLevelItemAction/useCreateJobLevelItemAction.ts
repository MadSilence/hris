import { useMutation } from "@tanstack/react-query";
import type {
  CreateJobLevelItemActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/createJobLevelItemAction";
import { createJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/createJobLevelItemAction";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";

export const useCreateJobLevelItemAction = () => {
  const revalidateJobLevelItemQuery = useInvalidateJobLevelItemQuery();

  return useMutation({
    mutationFn: (payload: CreateJobLevelItemActionInput) =>
      createJobLevelItemAction(payload),
    onSuccess: () => {
      revalidateJobLevelItemQuery();
    },
  });
};
