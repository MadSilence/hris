jest.mock("next/server", () => {
  class MockHeaders {
    private values = new Map<string, string>();

    get(name: string) {
      return this.values.get(name.toLowerCase()) ?? null;
    }

    set(name: string, value: string) {
      this.values.set(name.toLowerCase(), value);
    }
  }

  class MockNextResponse {
    headers = new MockHeaders();
    cookies = {
      set: jest.fn((cookie: any) => {
        const current = this.headers.get("set-cookie");

        const serialized = [
          `${cookie.name}=${cookie.value}`,
          cookie.httpOnly ? "HttpOnly" : null,
          cookie.sameSite ? `SameSite=${cookie.sameSite}` : null,
          cookie.secure ? "Secure" : null,
          cookie.path ? `Path=${cookie.path}` : null,
        ]
          .filter(Boolean)
          .join("; ");

        this.headers.set(
          "set-cookie",
          current ? `${current}, ${serialized}` : serialized
        );
      }),
    };

    constructor(private body: any, public init?: any) {
    }

    async json() {
      return this.body;
    }

    static json(body: any, init?: any) {
      return new MockNextResponse(body, init);
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

import { impersonationRoutes } from "@/api/modules/impersonation/routes/impersonationRoutes";
import { hrisApiImpersonationService } from "@/api/modules/impersonation/services/hrisImpersonationService";

jest.mock("@/api/modules/impersonation/services/hrisImpersonationService", () => ({
  hrisApiImpersonationService: {
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

describe("ImpersonationRoutes", () => {
  const OLD_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      configurable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: OLD_ENV,
      configurable: true,
    });
  });

  it("starts impersonation and sets auth cookies", async () => {
    jest.mocked(hrisApiImpersonationService.start).mockResolvedValue({
      accessToken: "new-access-token",
      impersonating: true,
      actorId: "actor-id",
      subjectId: "subject-id",
    });

    const req = {
      json: async () => ({ targetUserId: "target-id" }),
    } as Request;

    const res = await impersonationRoutes.start(req);
    const body = await res.json();

    expect(hrisApiImpersonationService.start).toHaveBeenCalledWith({
      targetUserId: "target-id",
    });

    expect(body).toEqual({
      ok: true,
      impersonating: true,
      actorId: "actor-id",
      subjectId: "subject-id",
    });

    const setCookie = res.headers.get("set-cookie");

    expect(setCookie).toContain("access_token=new-access-token");
    expect(setCookie).toContain("has_session=1");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Path=/");
  });

  it("stops impersonation and sets auth cookies", async () => {
    jest.mocked(hrisApiImpersonationService.stop).mockResolvedValue({
      accessToken: "admin-access-token",
      impersonating: false,
      actorId: "actor-id",
      subjectId: "actor-id",
    });

    const res = await impersonationRoutes.stop({} as Request);
    const body = await res.json();

    expect(hrisApiImpersonationService.stop).toHaveBeenCalledWith();

    expect(body).toEqual({
      ok: true,
      impersonating: false,
      actorId: "actor-id",
      subjectId: "actor-id",
    });

    const setCookie = res.headers.get("set-cookie");

    expect(setCookie).toContain("access_token=admin-access-token");
    expect(setCookie).toContain("has_session=1");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Path=/");
  });
});
