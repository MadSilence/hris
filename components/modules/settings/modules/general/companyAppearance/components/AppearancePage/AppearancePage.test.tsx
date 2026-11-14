import { act, fireEvent, render, screen } from "@testing-library/react";

import { AppearancePage } from "./AppearancePage";
import { AppearanceActionError } from "@/components/modules/settings/modules/general/companyAppearance/hooks/useCompanyAppearance";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";

jest.mock("@/components/modules/settings/modules/general/companyAppearance/actions/companyAppearanceActions", () => ({
  updateCompanyAppearanceAction: jest.fn(),
}));
jest.mock("@/components/modules/settings/modules/general/companyAppearance/actions/companyLogoActions", () => ({
  uploadCompanyLogoAction: jest.fn(),
  deleteCompanyLogoAction: jest.fn(),
}));
jest.mock("@/components/modules/home/components", () => ({ HomeBand: () => null }));

const saved: CompanyAppearance = { accent: null, background: "COLOR", backgroundChosen: false, logoColors: [], version: 3 };

const renderPage = (appearance: Partial<CompanyAppearance> = {}, props: Partial<Parameters<typeof AppearancePage>[0]> = {}) => {
  const onSave = jest.fn(async () => ({ ...saved, ...appearance, version: 4 }));
  const all = {
    appearance: { ...saved, ...appearance },
    companyName: "Acme",
    logoUrl: null,
    address: "acme.noddo.test",
    canEdit: true,
    canChangeLogo: true,
    onSave,
    saving: false,
    saveError: null,
    onUploadLogo: jest.fn(async () => undefined),
    onRemoveLogo: jest.fn(async () => undefined),
    uploadingLogo: null,
    logoRefused: false,
    ...props,
  };
  const view = render(<AppearancePage {...all} />);
  return { ...all, view };
};

const ring = (name: string) => screen.getByRole("radio", { name });
const save = () => screen.getByRole("button", { name: "Save" });

describe("Appearance", () => {
  it("opens on what is saved, Wine picked, everything saved", () => {
    renderPage();

    expect(ring("Wine")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("All changes are saved.")).toBeInTheDocument();
    expect(screen.queryByText("Not saved yet")).not.toBeInTheDocument();
    expect(screen.getByText("Drop your logo here")).toBeInTheDocument();
    expect(screen.getByText(/Square PNG, JPEG or WebP/)).toBeInTheDocument();
  });

  it("puts the nine presets and Your own on the grid, the retired ones nowhere", () => {
    renderPage();

    ["Wine", "Cherry", "Tangerine", "Sunflower", "Basil", "Indigo", "Ocean", "Mulberry", "Black", "Your own"].forEach((name) =>
      expect(ring(name)).toBeInTheDocument(),
    );
    expect(screen.queryByRole("radio", { name: "Denim" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Graphite" })).not.toBeInTheDocument();
  });

  it("makes a picked ring the draft and saves it with the version it opened on", async () => {
    const { onSave } = renderPage();

    fireEvent.click(ring("Basil"));
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
    expect(screen.getByText("Not saved yet")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(save());
    });

    expect(onSave).toHaveBeenCalledWith({ accent: "basil", version: 3 });
  });

  it("saves nothing when nothing changed, and Save is never disabled", async () => {
    const { onSave } = renderPage();

    expect(save()).toBeEnabled();
    await act(async () => {
      fireEvent.click(save());
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("sends the background only once somebody picked it", async () => {
    const { onSave } = renderPage();

    fireEvent.click(screen.getByRole("radio", { name: "Light" }));
    await act(async () => {
      fireEvent.click(save());
    });

    expect(onSave).toHaveBeenCalledWith({ accent: null, background: "LIGHT", version: 3 });
  });

  it("offers Light by itself for a logo of several colours, and shows them under From your logo", () => {
    renderPage({ logoColors: ["#be123c", "#f5c518"] });

    expect(screen.getByText("From your logo")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Not saved yet")).toBeInTheDocument();
  });

  it("never touches a background the company chose", () => {
    renderPage({ logoColors: ["#be123c", "#f5c518"], backgroundChosen: true });

    expect(screen.getByRole("radio", { name: "Your color" })).toHaveAttribute("aria-checked", "true");
  });

  it("says when somebody else saved first, with Reload", () => {
    renderPage({}, { saveError: new AppearanceActionError({ code: "E00409" }) });
    fireEvent.click(ring("Ocean"));

    expect(screen.getByText(/Someone else saved first/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("refuses a wrong colour code in its field and keeps the last good colour", () => {
    renderPage();

    fireEvent.click(ring("Your own"));
    fireEvent.change(screen.getByLabelText("Color code"), { target: { value: "#12" } });

    expect(screen.getByText("Enter a color as #rrggbb, like #2f63c4.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Color code"), { target: { value: "047857" } });
    expect(screen.getByText("Your own · #047857")).toBeInTheDocument();
    expect(screen.getByText(/Close to the color noddo uses for approvals/)).toBeInTheDocument();
  });

  it("is view only without the right: the Banner, the rings dimmed, no Save", () => {
    renderPage({}, { canEdit: false, canChangeLogo: false });

    expect(screen.getByText("Only people who can manage company settings can change Appearance.")).toBeInTheDocument();
    expect(ring("Wine")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("says a refused logo in the drop zone", () => {
    renderPage({}, { logoRefused: true });

    expect(screen.getByRole("alert")).toHaveTextContent("That file can’t be used.");
  });
});
