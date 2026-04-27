import { act, renderHook } from "@testing-library/react";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useStartImpersonation } from "@/components/modules/auth/impersonation/hooks/useStartImpersonation/useStartImpersonation";

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
    mutate: async (payload: any) => {
      const result = await config.mutationFn(payload);
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

describe("useStartImpersonation", () => {
  const setIdentity = jest.fn();
  const clearCurrentUserCache = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        impersonating: true,
        actorId: "admin-id",
        subjectId: "target-id",
      }),
    }) as jest.Mock;

    jest.mocked(useCurrentUser).mockReturnValue({
      setIdentity,
      clearCurrentUserCache,
    } as any);
  });

  it("starts impersonation and updates current user state", async () => {
    const { result } = renderHook(() => useStartImpersonation());

    await act(async () => {
      await result.current.mutate({ targetUserId: "target-id" });
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/impersonate/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetUserId: "target-id" }),
    });

    expect(clearPermissionsStorage).toHaveBeenCalled();
    expect(clearCurrentUserCache).toHaveBeenCalled();

    expect(setIdentity).toHaveBeenCalledWith({
      id: "target-id",
      impersonating: true,
      actorId: "admin-id",
      subjectId: "target-id",
    });

    expect(push).toHaveBeenCalledWith("/organization/people");
    expect(refresh).toHaveBeenCalled();
  });

  it("throws when request fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as jest.Mock;

    const { result } = renderHook(() => useStartImpersonation());

    await expect(
      result.current.mutateAsync({ targetUserId: "target-id" })
    ).rejects.toThrow("Failed to start impersonation");
  });
});
