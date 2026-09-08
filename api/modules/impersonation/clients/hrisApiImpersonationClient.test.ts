import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    postWithResponse: jest.fn(),
  },
}));

describe("HrisApiImpersonationClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * `postWithResponse`, not `post`, and that is the whole point of these two tests.
   *
   * Both calls answer with a `Set-Cookie` carrying a refresh token. The plain `post` discards the
   * response, so the header never reached the route and the browser kept the **actor's** refresh
   * token — one renewal and an impersonated session was the actor's again, banner still up.
   */
  it("starts impersonation, keeping the response the cookie is on", async () => {
    const answer = {
      data: {
        accessToken: "token",
        impersonating: true,
        actorId: "actor-id",
        subjectId: "subject-id",
      },
      // A bare stand-in: this test is about the response being carried, not about its contents.
      response: { headers: { get: () => null } } as unknown as Response,
    };

    jest.mocked(hrisApiClient.postWithResponse).mockResolvedValue(answer);

    const result = await hrisApiImpersonationClient.start({
      targetUserId: "target-id",
    });

    expect(hrisApiClient.postWithResponse).toHaveBeenCalledWith(
      "/auth/impersonate/start",
      { targetUserId: "target-id" }
    );
    expect(result).toEqual(answer);
  });

  it("stops impersonation, keeping the response the cookie is on", async () => {
    const answer = {
      data: {
        accessToken: "token",
        impersonating: false,
        actorId: "actor-id",
        subjectId: "actor-id",
      },
      // A bare stand-in: this test is about the response being carried, not about its contents.
      response: { headers: { get: () => null } } as unknown as Response,
    };

    jest.mocked(hrisApiClient.postWithResponse).mockResolvedValue(answer);

    const result = await hrisApiImpersonationClient.stop();

    expect(hrisApiClient.postWithResponse).toHaveBeenCalledWith(
      "/auth/impersonate/stop"
    );
    expect(result).toEqual(answer);
  });
});
