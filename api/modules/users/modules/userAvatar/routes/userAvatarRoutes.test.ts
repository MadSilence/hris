import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services";
import { userAvatarRoutes } from "@/api/modules/users/modules/userAvatar/routes/userAvatarRoutes";

class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: any
  ) {
    this.status = init?.status ?? 200;
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: any) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

jest.mock("@/api/modules/users/modules/userAvatar/services", () => ({
  hrisUserAvatarService: {
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  },
}));

describe("UserAvatarRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads user avatar", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const response = { id: "avatar-id" };

    jest.mocked(hrisUserAvatarService.uploadAvatar).mockResolvedValue(response);

    const req = {
      formData: async () => {
        const formData = new FormData();
        formData.append("file", file);
        return formData;
      },
    } as Request;

    const res = await userAvatarRoutes.uploadAvatar(req, "user-id");
    const result = await res.json();

    expect(hrisUserAvatarService.uploadAvatar).toHaveBeenCalledWith(
      "user-id",
      file
    );
    expect(result).toEqual(response);
  });

  it("returns 400 when file is missing", async () => {
    const req = {
      formData: async () => new FormData(),
    } as Request;

    const res = await userAvatarRoutes.uploadAvatar(req, "user-id");
    const result = await res.json();

    expect(hrisUserAvatarService.uploadAvatar).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(result).toEqual({ message: "File is required" });
  });

  it("deletes user avatar", async () => {
    jest.mocked(hrisUserAvatarService.deleteAvatar).mockResolvedValue(undefined);

    const res = await userAvatarRoutes.deleteAvatar({} as Request, "user-id");

    expect(hrisUserAvatarService.deleteAvatar).toHaveBeenCalledWith("user-id");
    expect(res.status).toBe(204);
  });
});
