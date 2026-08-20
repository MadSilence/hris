import type { CapturedReactQueryOptions } from "@/test/types";
import { partialMock } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { internalApiClient } from "@/components/clients/apiClient";
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
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: (config: CapturedReactQueryOptions) => ({
    mutateAsync: config.mutationFn,
    mutate: async (payload: unknown) => {
      const result = await config.mutationFn(payload);
      config.onSuccess?.(result);
      return result;
    },
  }),
}));

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { post: jest.fn() },
}));

jest.mock("@/components/auth/permissionsStorage", () => ({
  clearPermissionsStorage: jest.fn(),
}));

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));

const mockPost = internalApiClient.post as jest.Mock;

describe("useStartImpersonation", () => {
  const setIdentity = jest.fn();
  const clearCurrentUserCache = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockPost.mockResolvedValue({
      ok: true,
      impersonating: true,
      actorId: "admin-id",
      subjectId: "target-id",
    });

    jest.mocked(useCurrentUser).mockReturnValue(partialMock({
      setIdentity,
      clearCurrentUserCache,
    }));
  });

  it("starts impersonation and updates current user state", async () => {
    const { result } = renderHook(() => useStartImpersonation());

    await act(async () => {
      await result.current.mutate({ targetUserId: "target-id" });
    });

    expect(mockPost).toHaveBeenCalledWith("/auth/impersonate/start", {
      targetUserId: "target-id",
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
    mockPost.mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(() => useStartImpersonation());

    await expect(
      result.current.mutateAsync({ targetUserId: "target-id" })
    ).rejects.toThrow();
  });
});
