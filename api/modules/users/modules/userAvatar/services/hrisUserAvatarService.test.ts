import { hrisApiUserAvatarClient } from "@/api/modules/users/modules/userAvatar/clients";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";

jest.mock("@/api/modules/users/modules/userAvatar/clients", () => ({
  hrisApiUserAvatarClient: {
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  },
}));

describe("HrisUserAvatarService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates uploadAvatar to client", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const response = { id: "avatar-id" };

    jest.mocked(hrisApiUserAvatarClient.uploadAvatar).mockResolvedValue(response);

    const result = await hrisUserAvatarService.uploadAvatar("user-id", file);

    expect(hrisApiUserAvatarClient.uploadAvatar).toHaveBeenCalledWith(
      "user-id",
      file
    );
    expect(result).toEqual(response);
  });

  it("delegates deleteAvatar to client", async () => {
    jest.mocked(hrisApiUserAvatarClient.deleteAvatar).mockResolvedValue(undefined);

    const result = await hrisUserAvatarService.deleteAvatar("user-id");

    expect(hrisApiUserAvatarClient.deleteAvatar).toHaveBeenCalledWith("user-id");
    expect(result).toBeUndefined();
  });
});
