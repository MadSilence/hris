import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DeleteProfileModal } from "./DeleteProfileModal";

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get: () => new Promise(() => {}) } }),
}));

const open = (onTerminateInstead: (() => void) | null) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DeleteProfileModal
        isOpen
        userId="u1"
        fullName="Ada Lovelace"
        isBusy={false}
        error={null}
        onTerminateInstead={onTerminateInstead}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    </QueryClientProvider>,
  );

describe("DeleteProfileModal", () => {
  it("points at Terminate while Terminate is on offer", () => {
    open(jest.fn());
    expect(screen.getByText(/terminate the employment instead/i)).toBeInTheDocument();
  });

  // WALK_QUESTIONS § 17: an already terminated person has no Terminate button to point at.
  it("does not advise terminating a person who is already terminated", () => {
    open(null);
    expect(screen.queryByText(/terminate the employment instead/i)).not.toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });
});
