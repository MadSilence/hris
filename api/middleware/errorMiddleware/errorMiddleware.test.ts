import type { NextRequest } from "next/server";
import { withErrorMiddleware } from "./errorMiddleware";
import { ConflictError, ServerError } from "@/components/clients/exceptions";

// `next/server` needs the Fetch API's globals, which jsdom lacks; the middleware only calls `NextResponse.json`.
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init: { status: number }) => ({ status: init.status, json: async () => body }),
  },
}));
jest.mock("@/api/modules/auth/services/jwtService", () => ({ UnauthorizedError: class extends Error {} }));

const run = async (error: unknown) => {
  const handler = withErrorMiddleware(async () => {
    throw error;
  });
  return (await handler({} as NextRequest, undefined)) as unknown as { status: number; json: () => Promise<{ code?: string }> };
};

describe("withErrorMiddleware", () => {
  it("keeps a refusal for asking too often a 429, with its code (the fifth wrong code, a resend too soon)", async () => {
    const res = await run(new ServerError("Too many", { status: 429, code: "AUTH00002" }));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("AUTH00002");
  });

  it("answers a real server failure 500", async () => {
    const res = await run(new ServerError("Boom", { status: 500 }));
    expect(res.status).toBe(500);
  });

  it("keeps the classes it already knew", async () => {
    const res = await run(new ConflictError("Taken", { status: 409, code: "X" }));
    expect(res.status).toBe(409);
  });
});
