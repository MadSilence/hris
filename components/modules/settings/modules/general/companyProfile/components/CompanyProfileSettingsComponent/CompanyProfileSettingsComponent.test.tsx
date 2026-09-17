import { fireEvent, render, screen } from "@testing-library/react";

import { CompanyProfileSettingsComponent } from "./CompanyProfileSettingsComponent";
import type { Company } from "@/models/company/Company";
import type { CompanySettings } from "@/models/company/CompanySettings";

jest.mock("@/components/layout/SettingsPageHeader/SettingsPageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const company: Company = {
  id: "company-1",
  name: "SixSoftware",
  subdomain: "sixsoftware",
  companyLogo: null,
  description: "We build things.",
  website: "https://six.example",
  version: 4,
};

const settings: CompanySettings = {
  timezone: "Europe/Warsaw",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  weekStartDay: "MONDAY",
  version: 9,
};

const renderComponent = (overrides: Partial<Company> = {}) => {
  const props = {
    company: { ...company, ...overrides },
    settings,
    onSaveProfile: jest.fn(),
    onSaveSettings: jest.fn(),
    savingProfile: false,
    savingSettings: false,
    profileError: null,
    settingsError: null,
  };

  const view = render(<CompanyProfileSettingsComponent {...props} />);
  return { ...props, rerender: view.rerender };
};

const saveButton = () => screen.getByRole("button", { name: /save changes/i });
const querySaveButton = () => screen.queryByRole("button", { name: /save changes/i });
const nameInput = () => screen.getByLabelText(/company name/i);

describe("CompanyProfileSettingsComponent", () => {
  it("offers no Save or Cancel until something changes", () => {
    renderComponent();

    expect(querySaveButton()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();

    fireEvent.change(nameInput(), { target: { value: "Seven Software" } });

    expect(saveButton()).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("saves only the half that changed", () => {
    const { onSaveProfile, onSaveSettings } = renderComponent();

    fireEvent.change(nameInput(), { target: { value: "  Seven Software  " } });
    fireEvent.click(saveButton());

    expect(onSaveProfile).toHaveBeenCalledWith({
      name: "Seven Software",
      description: "We build things.",
      website: "https://six.example",
      version: 4,
    });
    expect(onSaveSettings).not.toHaveBeenCalled();
  });

  it("holds the version it was opened with once edited, so a colleague's save in between is refused", () => {
    const { rerender, ...props } = renderComponent();

    fireEvent.change(nameInput(), { target: { value: "Seven Software" } });

    // A refetch brings a colleague's change while this form is being edited.
    rerender(
      <CompanyProfileSettingsComponent
        {...props}
        company={{ ...company, description: "Changed by a colleague.", version: 5 }}
      />,
    );
    fireEvent.click(saveButton());

    expect(props.onSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ version: 4 }));
  });

  it("follows a newer version while nothing has been typed", () => {
    const { rerender, ...props } = renderComponent();

    rerender(
      <CompanyProfileSettingsComponent {...props} company={{ ...company, version: 5 }} />,
    );
    fireEvent.change(nameInput(), { target: { value: "Seven Software" } });
    fireEvent.click(saveButton());

    expect(props.onSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ version: 5 }));
  });

  it("sends working days in week order, whichever order they were clicked", () => {
    const { onSaveSettings, onSaveProfile } = renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Sun" }));
    fireEvent.click(screen.getByRole("button", { name: "Sat" }));
    fireEvent.click(saveButton());

    expect(onSaveSettings).toHaveBeenCalledWith({
      timezone: "Europe/Warsaw",
      weekStartDay: "MONDAY",
      workingDays: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      version: 9,
    });
    expect(onSaveProfile).not.toHaveBeenCalled();
  });

  it("blocks saving with an empty name or an empty working week", () => {
    renderComponent();

    fireEvent.change(nameInput(), { target: { value: "  " } });

    expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();

    fireEvent.change(nameInput(), { target: { value: "SixSoftware" } });

    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
      fireEvent.click(screen.getByRole("button", { name: day }));
    }

    expect(screen.getByText(/at least one working day/i)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it("cancel returns every field to the saved state", () => {
    renderComponent();

    fireEvent.change(nameInput(), { target: { value: "Seven Software" } });
    fireEvent.click(screen.getByRole("button", { name: "Sun" }));

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(querySaveButton()).not.toBeInTheDocument();
    expect(nameInput()).toHaveValue("SixSoftware");
    expect(screen.getByRole("button", { name: "Sun" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows initials while no logo is uploaded", () => {
    renderComponent({ name: "Acme Industries", companyLogo: null });

    expect(screen.getByText("AI")).toBeInTheDocument();
  });
});
