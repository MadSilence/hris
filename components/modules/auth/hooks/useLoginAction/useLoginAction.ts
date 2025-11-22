import { useMutation } from "@tanstack/react-query";
import { useAuthService } from "../useAuthService";
import type { LoginRequest, LoginResponse } from "../../services/AuthService";

export const useLoginAction = () => {
  const authService = useAuthService();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (payload) => authService.login(payload),
  });
};
