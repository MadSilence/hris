import { useMutation } from "@tanstack/react-query";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";
import type {
  DeleteJobLevelItemActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/deleteJobLevelItemAction";
import { deleteJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/deleteJobLevelItemAction";

export const useDeleteJobLevelItemAction = () => {
  const revalidateJobLevelItemQuery = useInvalidateJobLevelItemQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobLevelItemActionInput) =>
      deleteJobLevelItemAction(payload),
    onSuccess: () => {
      revalidateJobLevelItemQuery();
    },
  });
};
