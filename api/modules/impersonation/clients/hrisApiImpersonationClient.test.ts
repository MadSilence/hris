import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    post: jest.fn(),
  },
}));

describe("HrisApiImpersonationClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts impersonation", async () => {
    const response = {
      accessToken: "token",
      impersonating: true,
      actorId: "actor-id",
      subjectId: "subject-id",
    };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiImpersonationClient.start({
      targetUserId: "target-id",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/auth/impersonate/start",
      { targetUserId: "target-id" }
    );
    expect(result).toEqual(response);
  });

  it("stops impersonation", async () => {
    const response = {
      accessToken: "token",
      impersonating: false,
      actorId: "actor-id",
      subjectId: "actor-id",
    };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiImpersonationClient.stop();

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/auth/impersonate/stop"
    );
    expect(result).toEqual(response);
  });
});
