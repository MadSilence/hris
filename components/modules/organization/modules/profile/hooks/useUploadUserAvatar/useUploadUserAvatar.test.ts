import { act, renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UploadUserAvatarActionInput } from "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction";
import { uploadUserAvatarAction } from "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction";
import { useUploadUserAvatar } from "./useUploadUserAvatar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction",
  () => ({
    uploadUserAvatarAction: jest.fn(),
  }),
);

describe("useUploadUserAvatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls uploadUserAvatarAction and invalidates queries on success", async () => {
    const mockFile = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    const mockPayload: UploadUserAvatarActionInput = {
      userId: "user-1",
      file: mockFile,
    };

    const invalidateQueries = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries,
    });

    (uploadUserAvatarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useUploadUserAvatar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(uploadUserAvatarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalled();
  });
});
