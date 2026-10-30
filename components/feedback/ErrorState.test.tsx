import { render, screen } from "@testing-library/react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError, ServerError } from "@/components/clients/exceptions";

describe("ErrorState", () => {
  it("offers a retry for a failure that may pass", () => {
    render(<ErrorState error={new ServerError("boom", { status: 500, code: "E00500" })} onRetry={jest.fn()} />);
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
  });

  // A refusal of rights answers the same however often it is asked (walk of 2026-10-30).
  it("offers no retry for a refusal of rights", () => {
    render(<ErrorState error={new ForbiddenError("nope", { status: 403, code: "E00403" })} onRetry={jest.fn()} />);
    expect(screen.getByText("You do not have access to this")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Try again/ })).not.toBeInTheDocument();
  });
});
