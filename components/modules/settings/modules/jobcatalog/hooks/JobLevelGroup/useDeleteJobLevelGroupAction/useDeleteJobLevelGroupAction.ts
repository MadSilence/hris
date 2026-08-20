import { useMutation } from "@tanstack/react-query";
import type { DeleteJobLevelGroupActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";
import { deleteJobLevelGroupAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";
import { useInvalidateJobLevelGroupsQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroups";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Grades are read as part of their track, so every mutation invalidates that one query. The job
 * catalogue goes with it: a grade rename or removal changes the Level column on the other tab.
 */
export const useDeleteJobLevelGroupAction = () => {
  const invalidateGroups = useInvalidateJobLevelGroupsQuery();
  const invalidateFamilies = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobLevelGroupActionInput) => deleteJobLevelGroupAction(payload),
    onSuccess: () => {
      invalidateGroups();
      invalidateFamilies();
    },
  });
};
