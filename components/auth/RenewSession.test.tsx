import { render, waitFor } from "@testing-library/react";
import { RenewSession } from "@/components/auth/RenewSession";
import { sessionNavigation } from "@/components/clients/apiClient/internalApiClient";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const response = (status: number) => ({ ok: status >= 200 && status < 300, status }) as Response;

describe("RenewSession — a 401 during a server render", () => {
  let toLogin: jest.SpyInstance;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    window.sessionStorage.clear();
    refresh.mockClear();
    toLogin = jest.spyOn(sessionNavigation, "redirectToLogin").mockImplementation(() => {});
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => toLogin.mockRestore());

  it("renews the session and renders the server part again instead of signing the person out", async () => {
    fetchMock.mockResolvedValue(response(200));
    render(<RenewSession/>);
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/refresh", expect.objectContaining({ method: "POST" }));
    expect(toLogin).not.toHaveBeenCalled();
  });

  it("goes to the login when the renewal is refused", async () => {
    fetchMock.mockResolvedValue(response(401));
    render(<RenewSession/>);
    await waitFor(() => expect(toLogin).toHaveBeenCalledTimes(1));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("goes to the login when the render is refused again straight after a renewal", async () => {
    fetchMock.mockResolvedValue(response(200));
    const first = render(<RenewSession/>);
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    first.unmount();

    render(<RenewSession/>);
    await waitFor(() => expect(toLogin).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
