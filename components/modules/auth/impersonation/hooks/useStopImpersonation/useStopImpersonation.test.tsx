import type { CapturedReactQueryOptions } from "@/test/types";
import { partialMock } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { internalApiClient, sessionNavigation } from "@/components/clients/apiClient";
import { UnauthorizedError } from "@/components/clients/exceptions";
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

// `mock` prefix: jest.mock factories may only reach variables named so.
let mockCaptured: CapturedReactQueryOptions;

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: (config: CapturedReactQueryOptions) => {
    mockCaptured = config;
    return {
      mutateAsync: config.mutationFn,
      mutate: async () => {
        const result = await config.mutationFn();
        config.onSuccess?.(result);
        return result;
      },
    };
  },
}));

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { post: jest.fn() },
  sessionNavigation: { redirectToLogin: jest.fn() },
}));

jest.mock("@/components/auth/permissionsStorage", () => ({
  clearPermissionsStorage: jest.fn(),
}));

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));

const mockPost = internalApiClient.post as jest.Mock;

describe("useStopImpersonation", () => {
  const setIdentity = jest.fn();
  const clearCurrentUserCache = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockPost.mockResolvedValue({
      ok: true,
      impersonating: false,
      actorId: "admin-id",
      subjectId: "admin-id",
    });

    jest.mocked(useCurrentUser).mockReturnValue(partialMock({
      setIdentity,
      clearCurrentUserCache,
    }));
  });

  it("stops impersonation and restores current user state", async () => {
    const { result } = renderHook(() => useStopImpersonation());

    await act(async () => {
      await result.current.mutate();
    });

    expect(mockPost).toHaveBeenCalledWith("/auth/impersonate/stop");

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

  it("signs out and opens the login page when the actor may no longer have a session", async () => {
    renderHook(() => useStopImpersonation());

    await act(async () => {
      await mockCaptured.onError(new UnauthorizedError("Unauthorized", { status: 401 }));
    });

    expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    expect(sessionNavigation.redirectToLogin).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("leaves any other refusal where it is", async () => {
    renderHook(() => useStopImpersonation());

    await act(async () => {
      await mockCaptured.onError(new Error("Server down"));
    });

    expect(sessionNavigation.redirectToLogin).not.toHaveBeenCalled();
  });

  it("throws when request fails", async () => {
    mockPost.mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(() => useStopImpersonation());

    await expect(result.current.mutateAsync()).rejects.toThrow();
  });
});
