import { act, renderHook } from "@testing-library/react";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useStopImpersonation } from "@/components/modules/auth/impersonation/hooks/useStopImpersonation/useStopImpersonation";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: (config: any) => ({
    mutateAsync: config.mutationFn,
    mutate: async () => {
      const result = await config.mutationFn();
      config.onSuccess?.(result);
      return result;
    },
  }),
}));

jest.mock("@/components/auth/permissionsStorage", () => ({
  clearPermissionsStorage: jest.fn(),
}));

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));

describe("useStopImpersonation", () => {
  const setIdentity = jest.fn();
  const clearCurrentUserCache = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        impersonating: false,
        actorId: "admin-id",
        subjectId: "admin-id",
      }),
    }) as jest.Mock;

    jest.mocked(useCurrentUser).mockReturnValue({
      setIdentity,
      clearCurrentUserCache,
    } as any);
  });

  it("stops impersonation and restores current user state", async () => {
    const { result } = renderHook(() => useStopImpersonation());

    await act(async () => {
      await result.current.mutate();
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/impersonate/stop", {
      method: "POST",
      credentials: "include",
    });

    expect(clearPermissionsStorage).toHaveBeenCalled();
    expect(clearCurrentUserCache).toHaveBeenCalled();

    expect(setIdentity).toHaveBeenCalledWith({
      id: "admin-id",
      impersonating: false,
      actorId: "admin-id",
      subjectId: "admin-id",
    });

    expect(push).toHaveBeenCalledWith("/organization/people");
    expect(refresh).toHaveBeenCalled();
  });

  it("throws when request fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as jest.Mock;

    const { result } = renderHook(() => useStopImpersonation());

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Failed to stop impersonation"
    );
  });
});
