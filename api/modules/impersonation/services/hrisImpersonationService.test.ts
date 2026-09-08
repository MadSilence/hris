import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";
import { hrisApiImpersonationService } from "@/api/modules/impersonation/services/hrisImpersonationService";

jest.mock("@/api/modules/impersonation/clients/hrisApiImpersonationClient", () => ({
  hrisApiImpersonationClient: {
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

/** A backend answer, body plus the `Set-Cookie` the refresh token actually arrives in. */
const backendAnswer = (
  data: Record<string, unknown>,
  setCookie?: string
): { data: never; response: Response } =>
  ({
    data,
    response: {
      headers: { get: (name: string) => (name === "set-cookie" ? setCookie ?? null : null) },
    },
  }) as never;

describe("HrisApiImpersonationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates start to client", async () => {
    const body = {
      accessToken: "token",
      impersonating: true,
      actorId: "actor-id",
      subjectId: "subject-id",
    };

    jest
      .mocked(hrisApiImpersonationClient.start)
      .mockResolvedValue(backendAnswer(body, "refresh_token=subject-refresh; Path=/; HttpOnly"));

    const result = await hrisApiImpersonationService.start({
      targetUserId: "target-id",
    });

    expect(hrisApiImpersonationClient.start).toHaveBeenCalledWith({
      targetUserId: "target-id",
    });
    expect(result).toEqual({ ...body, refreshToken: "subject-refresh" });
  });

  /**
   * The one that matters.
   *
   * The subject's refresh token arrives as a `Set-Cookie` addressed to this server. Dropping it left
   * the browser holding the **actor's**, so the first renewal turned an impersonated session back
   * into the actor's while the banner still read "Stop Impersonation" — reproduced in a browser
   * before this was fixed. Losing the token here is silent, which is why it needs its own test.
   */
  it("carries the subject's refresh token off the response, not just the body", async () => {
    jest.mocked(hrisApiImpersonationClient.start).mockResolvedValue(
      backendAnswer(
        { accessToken: "a", impersonating: true, actorId: "actor", subjectId: "subject" },
        "refresh_token=the-subjects-token; Path=/; HttpOnly; SameSite=Lax"
      )
    );

    const result = await hrisApiImpersonationService.start({ targetUserId: "subject" });

    expect(result.refreshToken).toBe("the-subjects-token");
  });

  it("delegates stop to client and carries the actor's token back", async () => {
    const body = {
      accessToken: "token",
      impersonating: false,
      actorId: "actor-id",
      subjectId: "actor-id",
    };

    jest
      .mocked(hrisApiImpersonationClient.stop)
      .mockResolvedValue(backendAnswer(body, "refresh_token=actor-refresh; Path=/"));

    const result = await hrisApiImpersonationService.stop();

    expect(hrisApiImpersonationClient.stop).toHaveBeenCalledWith();
    expect(result).toEqual({ ...body, refreshToken: "actor-refresh" });
  });

  /** No header means the backend chose not to rotate; the cookie already on the browser stands. */
  it("leaves refreshToken undefined when the backend sent no cookie", async () => {
    jest.mocked(hrisApiImpersonationClient.stop).mockResolvedValue(
      backendAnswer({ accessToken: "a", impersonating: false, actorId: "x", subjectId: "x" })
    );

    const result = await hrisApiImpersonationService.stop();

    expect(result.refreshToken).toBeUndefined();
  });
});
