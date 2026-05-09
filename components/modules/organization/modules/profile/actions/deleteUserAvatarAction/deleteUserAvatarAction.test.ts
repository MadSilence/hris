import { ActionStatus } from "@/components/models/ActionStatus";
import type { DeleteUserAvatarActionInput } from "./deleteUserAvatarAction";
import { deleteUserAvatarAction } from "./deleteUserAvatarAction";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";

jest.mock("@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService");

describe("deleteUserAvatarAction", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  const mockInput: DeleteUserAvatarActionInput = {
    userId: "user-1",
  };

  it("calls hrisUserAvatarService.deleteAvatar with correct userId", async () => {
    await deleteUserAvatarAction(mockInput);

    expect(hrisUserAvatarService.deleteAvatar).toHaveBeenCalledWith("user-1");
  });

  it("returns SUCCESS when deleteAvatar resolves", async () => {
    (hrisUserAvatarService.deleteAvatar as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteUserAvatarAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when deleteAvatar rejects", async () => {
    (hrisUserAvatarService.deleteAvatar as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await deleteUserAvatarAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the avatar. Please try again.",
    });
  });
});
