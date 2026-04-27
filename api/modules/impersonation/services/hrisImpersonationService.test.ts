import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";
import { hrisApiImpersonationService } from "@/api/modules/impersonation/services/hrisImpersonationService";

jest.mock("@/api/modules/impersonation/clients/hrisApiImpersonationClient", () => ({
  hrisApiImpersonationClient: {
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

describe("HrisApiImpersonationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates start to client", async () => {
    const response = {
      accessToken: "token",
      impersonating: true,
      actorId: "actor-id",
      subjectId: "subject-id",
    };

    jest.mocked(hrisApiImpersonationClient.start).mockResolvedValue(response);

    const result = await hrisApiImpersonationService.start({
      targetUserId: "target-id",
    });

    expect(hrisApiImpersonationClient.start).toHaveBeenCalledWith({
      targetUserId: "target-id",
    });
    expect(result).toEqual(response);
  });

  it("delegates stop to client", async () => {
    const response = {
      accessToken: "token",
      impersonating: false,
      actorId: "actor-id",
      subjectId: "actor-id",
    };

    jest.mocked(hrisApiImpersonationClient.stop).mockResolvedValue(response);

    const result = await hrisApiImpersonationService.stop();

    expect(hrisApiImpersonationClient.stop).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });
});
