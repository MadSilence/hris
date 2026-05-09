import { act, renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteUserAvatarActionInput } from "@/components/modules/organization/modules/profile/actions/deleteUserAvatarAction";
import { deleteUserAvatarAction } from "@/components/modules/organization/modules/profile/actions/deleteUserAvatarAction";
import { useDeleteUserAvatar } from "./useDeleteUserAvatar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/organization/modules/profile/actions/deleteUserAvatarAction",
  () => ({
    deleteUserAvatarAction: jest.fn(),
  }),
);

describe("useDeleteUserAvatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteUserAvatarAction and invalidates queries on success", async () => {
    const mockPayload: DeleteUserAvatarActionInput = {
      userId: "user-1",
    };

    const invalidateQueries = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries,
    });

    (deleteUserAvatarAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useDeleteUserAvatar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteUserAvatarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalled();
  });
});
