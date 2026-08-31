import {
  InternalApiClient,
  sessionNavigation,
} from "@/components/clients/apiClient/internalApiClient";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/components/clients/exceptions";

// jsdom refuses to touch window.location, so the path is set through history and the redirect is
// observed on the wrapper the client calls.
let assign: jest.SpyInstance;

function mockLocation(pathname: string) {
  window.history.replaceState({}, "", pathname);
  assign.mockClear();
  return assign;
}

function jsonResponse(status: number, body: unknown = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("InternalApiClient", () => {
  let client: InternalApiClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    assign = jest.spyOn(sessionNavigation, "redirectToLogin").mockImplementation(() => {});
    client = new InternalApiClient("");
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    assign.mockRestore();
  });

  it("returns parsed JSON on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: "42" }));
    await expect(client.get<{ id: string }>("/things")).resolves.toEqual({ id: "42" });
  });

  it("maps 404 and 403 to their own errors", async () => {
    mockLocation("/settings");
    fetchMock.mockResolvedValueOnce(jsonResponse(404));
    await expect(client.get("/things")).rejects.toBeInstanceOf(NotFoundError);

    fetchMock.mockResolvedValueOnce(jsonResponse(403, { message: "nope" }));
    await expect(client.post("/things")).rejects.toBeInstanceOf(ForbiddenError);
  });

  // An expired access token is not a dead session. Tokens last 150 minutes and the refresh token
  // 30 days, so a working day used to end in a login screen with weeks of validity unused.
  it("renews the session on 401 and replays the request", async () => {
    const assign = mockLocation("/settings/general/departments");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401)) // expired access token
      .mockResolvedValueOnce(jsonResponse(200, { ok: true })) // refresh
      .mockResolvedValueOnce(jsonResponse(200, { id: "42" })); // the replay

    await expect(client.get<{ id: string }>("/things")).resolves.toEqual({ id: "42" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({ method: "POST" }),
    );
    expect(assign).not.toHaveBeenCalled();
  });

  // Rotating perm-hash (role edits, impersonation) leaves in-flight requests holding the previous
  // token. They come back 401 even though the session is fine, and throwing the user out of it was
  // the bug this covers.
  it("does not redirect on 401 when the session probe says the session is alive", async () => {
    const assign = mockLocation("/settings/general/departments");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "PERM_HASH_MISMATCH" })) // stale request
      .mockResolvedValueOnce(jsonResponse(401)) // renewal is not the answer here
      .mockResolvedValueOnce(jsonResponse(200, { id: "me" })); // probe: session is fine

    await expect(client.get("/departments/tree")).rejects.toBeInstanceOf(UnauthorizedError);

    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/users/me", expect.any(Object));
    expect(assign).not.toHaveBeenCalled();
  });

  it("redirects to /login when neither the renewal nor the probe helps", async () => {
    const assign = mockLocation("/settings/general/departments");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(401)) // refresh: the token is gone too
      .mockResolvedValueOnce(jsonResponse(401)); // probe fails too

    await expect(client.get("/departments/tree")).rejects.toBeInstanceOf(UnauthorizedError);

    expect(assign).toHaveBeenCalled();
  });

  it("never redirects or renews while already on the login page", async () => {
    const assign = mockLocation("/login");
    fetchMock.mockResolvedValueOnce(jsonResponse(401));

    await expect(client.post("/auth/login")).rejects.toBeInstanceOf(UnauthorizedError);

    expect(fetchMock).toHaveBeenCalledTimes(1); // no renewal, no probe
    expect(assign).not.toHaveBeenCalled();
  });
});
