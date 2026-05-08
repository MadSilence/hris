import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiUserAvatarClient } from "@/api/modules/users/modules/userAvatar/clients";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    post: jest.fn(),
    postForm: jest.fn(),
  },
}));

describe("HrisApiUserAvatarClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads user avatar", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const response = { id: "avatar-id" };

    jest.mocked(hrisApiClient.postForm).mockResolvedValue(response);

    const result = await hrisApiUserAvatarClient.uploadAvatar("user-id", file);

    expect(hrisApiClient.postForm).toHaveBeenCalledWith(
      "/api/users/user-id/avatar",
      expect.any(FormData)
    );
    expect(result).toEqual(response);
  });

  it("deletes user avatar", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(undefined);

    const result = await hrisApiUserAvatarClient.deleteAvatar("user-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/users/user-id/avatar/delete"
    );
    expect(result).toBeUndefined();
  });
});
