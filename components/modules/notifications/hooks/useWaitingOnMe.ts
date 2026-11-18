import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/components/modules/notifications/services/notificationsService";
import { getWaitingOnMeQueryKey } from "@/components/modules/notifications/utils/notificationsQueryKeys";

/**
 * What waits on the signed-in person — the one list (`/me/actions`, A1) Home's *Waiting on you* and a profile's bar
 * read. Refreshed after every successful write anywhere in the app (`QueryClientProviderWrapper`): approving leave,
 * ticking a task, agreeing to a page or signing all change it, and the list must not lag behind any of them.
 */
export const useWaitingOnMe = (enabled = true) =>
  useQuery({
    queryKey: getWaitingOnMeQueryKey(),
    queryFn: () => notificationsService.waitingOnMe(),
    enabled,
    staleTime: 15_000,
  });
