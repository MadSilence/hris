"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import type { OrgChartUser } from "@/models/orgChart/OrgChartUser";

export const ORG_CHART_QK = "ORG_CHART";

export const useOrgChart = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<OrgChartUser[]>({
    queryKey: [ORG_CHART_QK],
    queryFn: () => internalApiClient.get<OrgChartUser[]>("/users/org-chart"),
  });
};
