import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StepUpDialog } from "./StepUpDialog";
import { requestStepUp } from "./stepUp";

const get = jest.fn();
const post = jest.fn();
jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get, post } }),
}));
jest.mock("@/components/modules/mfa/actions", () => ({ stepUpAction: jest.fn() }));

const answer = (mfa: { enrolled: boolean }, ways: { hasPassword: boolean }) =>
  get.mockImplementation((path: string) =>
    Promise.resolve(path === "/auth/mfa" ? mfa : { ...ways, accounts: [], offered: [], passwordRemovable: false }));

const openDialog = () => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <StepUpDialog />
    </QueryClientProvider>,
  );
  let proved!: Promise<boolean>;
  act(() => {
    proved = requestStepUp();
  });
  return proved;
};

// The owner, 2026-11-14: somebody with no password and no factor confirms with a code to their own mailbox.
describe("StepUpDialog, by email", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset().mockResolvedValue({ ok: true });
  });

  it("emails a code and confirms with it when there is no password and no factor", async () => {
    answer({ enrolled: false }, { hasPassword: false });
    const proved = openDialog();

    fireEvent.click(await screen.findByRole("button", { name: "Email me a code" }));
    await waitFor(() => expect(post).toHaveBeenCalledWith("/auth/step-up/email-code"));
    fireEvent.change(await screen.findByLabelText(/code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(post).toHaveBeenCalledWith("/auth/step-up/email-code/verify", { code: "123456" }));
    await expect(proved).resolves.toBe(true);
  });

  it("is not offered to somebody with a password", async () => {
    answer({ enrolled: false }, { hasPassword: true });
    openDialog();

    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Email me a code" })).not.toBeInTheDocument();
  });
});
