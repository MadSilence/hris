import { ActionStatus } from "@/components/models/ActionStatus";
import type { UploadUserAvatarActionInput } from "./uploadUserAvatarAction";
import { uploadUserAvatarAction } from "./uploadUserAvatarAction";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";

jest.mock("@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService");

describe("uploadUserAvatarAction", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  const mockFile = new File(["avatar"], "avatar.png", {
    type: "image/png",
  });

  const mockInput: UploadUserAvatarActionInput = {
    userId: "user-1",
    file: mockFile,
  };

  it("calls hrisUserAvatarService.uploadAvatar with correct arguments", async () => {
    await uploadUserAvatarAction(mockInput);

    expect(hrisUserAvatarService.uploadAvatar).toHaveBeenCalledWith(
      "user-1",
      mockFile,
    );
  });

  it("returns SUCCESS and data when uploadAvatar resolves", async () => {
    (hrisUserAvatarService.uploadAvatar as jest.Mock).mockResolvedValue({
      id: "avatar-1",
    });

    const result = await uploadUserAvatarAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: {
        id: "avatar-1",
      },
    });
  });

  it("returns ERROR when uploadAvatar rejects", async () => {
    (hrisUserAvatarService.uploadAvatar as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await uploadUserAvatarAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while uploading the avatar. Please try again.",
    });
  });
});
