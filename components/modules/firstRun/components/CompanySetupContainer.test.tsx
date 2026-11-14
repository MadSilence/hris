import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { CompanySetupDTO } from "@/api/modules/firstRun/dto";

const submit = jest.fn();
let setupData: CompanySetupDTO | undefined;

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/components/desact/select", () => jest.requireActual("@/test/selectMock"));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));

jest.mock("@/components/modules/firstRun/hooks", () => ({
  COMPANY_SETUP_QK: ["company-setup"],
  useCompanySetup: () => ({ data: setupData, error: null }),
  useSetupCountries: () => ({
    data: [{ code: "PL", name: "Poland", timezone: "Europe/Warsaw", weekStartDay: "MONDAY" }],
    isLoading: false,
  }),
}));

jest.mock("@/components/modules/firstRun/actions", () => ({
  submitCompanySetupAction: (payload: unknown) => submit(payload),
}));

import { CompanySetupContainer } from "./CompanySetupContainer";

const row = (patch: Partial<CompanySetupDTO>): CompanySetupDTO => ({
  status: "NOT_STARTED",
  industry: null,
  sizeBand: null,
  countryCode: null,
  dataset: "EMPTY",
  seededPeople: 0,
  step: null,
  stepCode: null,
  errorDetail: null,
  completedAt: null,
  ...patch,
});

/** S1 answered: an industry, 10–50 people, Poland. */
const answerS1 = () => {
  fireEvent.change(screen.getByLabelText("What does the company do?"), { target: { value: "Software & IT" } });
  fireEvent.change(screen.getByLabelText("How many people are in the company?"), { target: { value: "TEN_TO_50" } });
  fireEvent.change(screen.getByLabelText("Where is the company based?"), { target: { value: "PL" } });
};

/** first-run-setup S1–S5, read through the real catalogue. */
describe("CompanySetupContainer", () => {
  beforeEach(() => {
    setupData = undefined;
    submit.mockReset();
    submit.mockResolvedValue({ status: ActionStatus.SUCCESS });
  });

  it("S1 names the company and asks the company's language, starting on the screen's own", () => {
    render(<CompanySetupContainer companyName="Acme" />);

    expect(screen.getByText("Step 1 of 2 · Your company")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Let’s set up Acme");
    expect(screen.getByLabelText("Language")).toHaveValue("en");
    expect(screen.getByText("Everybody in the company sees noddo in it — screens, emails and exports.")).toBeInTheDocument();
  });

  it("S1's Continue, pressed with nothing answered, says what is missing beside each field", () => {
    render(<CompanySetupContainer companyName="Acme" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Choose an industry.")).toBeInTheDocument();
    expect(screen.getByText("Choose a size.")).toBeInTheDocument();
    expect(screen.getByText("Choose a country.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2 · Your company")).toBeInTheDocument();
  });

  it("the country says what it sets", () => {
    render(<CompanySetupContainer companyName="Acme" />);
    answerS1();

    expect(screen.getByText(
      "Sets your time zone to Europe/Warsaw, starts the week on Monday and builds Poland’s public holiday calendar.",
    )).toBeInTheDocument();
  });

  it("S2 offers two cards — no Full demo — and asks for a choice before it starts", () => {
    render(<CompanySetupContainer companyName="Acme" />);
    answerS1();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 2 of 2 · What to start with")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByText(/Full demo/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up my company" }));
    expect(screen.getByText("Choose what to start with.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("Example company opens the slider at the S1 size, moves stop by stop, and sends the number", async () => {
    render(<CompanySetupContainer companyName="Acme" />);
    answerS1();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("radio", { name: /Example company/ }));
    const slider = screen.getByRole("slider", { name: "Example people" });
    expect(slider).toHaveAttribute("aria-valuenow", "25");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    fireEvent.keyDown(slider, { key: "End" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "150");

    fireEvent.click(screen.getByRole("button", { name: "Set up my company" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      dataset: "SAMPLE", peopleCount: 150, sizeBand: "TEN_TO_50", countryCode: "PL", language: "en",
    })));
  });

  it("Start empty has no slider and sends no number", async () => {
    render(<CompanySetupContainer companyName="Acme" />);
    answerS1();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("radio", { name: /Start empty/ }));
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up my company" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ dataset: "EMPTY", peopleCount: null })));
  });

  it("S4: a failed run brings back S2 with the step it stopped on and the answers kept", () => {
    setupData = row({ status: "FAILED", dataset: "SAMPLE", seededPeople: 60, step: "Building your public holiday calendar", stepCode: "HOLIDAYS", errorDetail: "timeout" });
    render(<CompanySetupContainer companyName="Acme" />);

    expect(screen.getByText(
      "The last attempt stopped: we couldn’t build the public holiday calendar. Your answers are still here — try again.",
    )).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Example company/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "60");
  });

  it("S3: the progress list marks the current step, and Start empty has no example company", () => {
    setupData = row({ status: "RUNNING", dataset: "EMPTY", step: "Building your public holiday calendar", stepCode: "HOLIDAYS" });
    render(<CompanySetupContainer companyName="Acme" />);

    expect(screen.getByRole("heading", { name: "Setting up your company" })).toBeInTheDocument();
    expect(screen.getByText("Building your public holiday calendar").closest("li")).toHaveAttribute("data-state", "current");
    expect(screen.getByText("Getting started").closest("li")).toHaveAttribute("data-state", "done");
    expect(screen.getByText("Almost there").closest("li")).toHaveAttribute("data-state", "ahead");
    expect(screen.queryByText("Creating your example company")).not.toBeInTheDocument();
  });
});
