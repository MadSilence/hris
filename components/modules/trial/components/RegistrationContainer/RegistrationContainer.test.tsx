import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegistrationContainer } from "./RegistrationContainer";
import { useTrialService } from "@/components/modules/trial/hooks/useTrialService";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/trial/hooks/useTrialService");

const completeWithProvider = jest.fn();
beforeEach(() => {
  completeWithProvider.mockReset();
  jest.mocked(useTrialService).mockReturnValue(partialMock<ReturnType<typeof useTrialService>>({ completeWithProvider }));
});

const draft = { provider: "MICROSOFT" as const, email: "ada@acme.test", firstName: "Ada", lastName: "Lovelace" };

describe("RegistrationContainer — back from a provider (sign-in-registration B3, B3a)", () => {
  it("B3: who the provider says this is, names filled in, and no password", () => {
    render(<RegistrationContainer providerDraft={draft} />);

    expect(screen.getByText("You’re continuing with Microsoft.")).toBeInTheDocument();
    expect(screen.getByText("ada@acme.test")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Not you?" })).toHaveAttribute("href", "/api/auth/register/provider-forget");
    expect(screen.getByLabelText(/First name/)).toHaveValue("Ada");
    expect(screen.getByLabelText(/Last name/)).toHaveValue("Lovelace");
    expect(screen.queryByLabelText(/Password/)).not.toBeInTheDocument();
  });

  it("B3: sends the names and the company, not a password", async () => {
    // Never settles: the browser would leave for the new address here, which jsdom cannot do.
    completeWithProvider.mockReturnValue(new Promise(() => undefined));
    render(<RegistrationContainer providerDraft={draft} />);

    await userEvent.type(screen.getByLabelText(/Company name/), "Acme");
    await userEvent.click(screen.getByRole("button", { name: "Create my company" }));

    expect(completeWithProvider).toHaveBeenCalledWith({ firstName: "Ada", lastName: "Lovelace", companyName: "Acme" });
  });

  it("B3a: a draft that ran out says nothing was created, and starts again by forgetting it", () => {
    render(<RegistrationContainer providerDraft="expired" />);

    expect(screen.getByRole("heading", { name: "This step has expired" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start again" })).toHaveAttribute("href", "/api/auth/register/provider-forget");
  });
});
