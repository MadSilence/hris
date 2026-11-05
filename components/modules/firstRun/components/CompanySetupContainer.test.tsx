import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ActionStatus } from "@/components/models/ActionStatus";

const submit = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/components/modules/firstRun/hooks", () => ({
  COMPANY_SETUP_QK: ["company-setup"],
  useCompanySetup: () => ({ data: undefined, error: null }),
  useSetupCountries: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/components/modules/firstRun/actions", () => ({
  submitCompanySetupAction: (payload: unknown) => submit(payload),
}));

import { CompanySetupContainer } from "./CompanySetupContainer";

/**
 * The company's language is asked at setup (technical_documentation/I18N.md § 5): it starts on the language the screen is
 * already in, and travels with the answers, so the first screen after setup speaks it.
 */
describe("CompanySetupContainer — language", () => {
  beforeEach(() => {
    submit.mockResolvedValue({ status: ActionStatus.SUCCESS });
  });

  it("asks the company's language, starting on the screen's own", () => {
    render(<CompanySetupContainer companyName="Acme" />);

    expect(screen.getByLabelText(/language/i)).toHaveTextContent("English");
    expect(screen.getByText(/everybody in the company sees noddo in it/i)).toBeInTheDocument();
  });

  it("sends the language with the rest of the answers", async () => {
    render(<CompanySetupContainer companyName="Acme" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Set up my company" }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ language: "en" })));
  });
});
