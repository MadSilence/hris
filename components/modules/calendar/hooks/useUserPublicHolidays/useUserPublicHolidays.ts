import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userPublicHolidaysService } from "@/components/modules/calendar/services/userPublicHolidaysService";

type UseUserPublicHolidaysArgs = {
  userId: string;
  year?: number;
};

export const USER_PUBLIC_HOLIDAYS_QUERY_KEY = "user-public-holidays";

export const useUserPublicHolidays = ({ userId, year }: UseUserPublicHolidaysArgs) => {
  return useQuery({
    queryKey: [USER_PUBLIC_HOLIDAYS_QUERY_KEY, userId, year ?? "all"],
    // Year is a picker. Keep last year's days visible while this year's arrive.
    placeholderData: keepPreviousData,
    queryFn: () => userPublicHolidaysService.listByUserId(userId, year),
    enabled: Boolean(userId && userId !== "undefined"),
  });
};
