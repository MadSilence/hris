import { useMutation } from "@tanstack/react-query";
import type { ReorderJobLevelsActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/reorderJobLevelsAction";
import { reorderJobLevelsAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/reorderJobLevelsAction";
import { useInvalidateJobLevelGroupsQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroups";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Grades are read as part of their track, so every mutation invalidates that one query. The job
 * catalogue goes with it: a grade rename or removal changes the Level column on the other tab.
 */
export const useReorderJobLevelsAction = () => {
  const invalidateGroups = useInvalidateJobLevelGroupsQuery();
  const invalidateFamilies = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: ReorderJobLevelsActionInput) => reorderJobLevelsAction(payload),
    onSuccess: () => {
      invalidateGroups();
      invalidateFamilies();
    },
  });
};
