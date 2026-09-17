import { useMutation } from "@tanstack/react-query";
import { useAuthService } from "../useAuthService";

/** Ends the session on this browser: the three session cookies, through the logout route handler. */
export const useLogoutAction = () => {
  const authService = useAuthService();

  return useMutation<{ ok: boolean }, Error, void>({
    mutationFn: () => authService.logout(),
  });
};
