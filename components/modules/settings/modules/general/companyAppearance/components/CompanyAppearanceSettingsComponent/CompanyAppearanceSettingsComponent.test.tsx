import { fireEvent, render, screen } from "@testing-library/react";

import { CompanyAppearanceSettingsComponent } from "./CompanyAppearanceSettingsComponent";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";

jest.mock("@/components/layout/SettingsPageHeader/SettingsPageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const defaults: CompanyAppearance = {
  accent: null,
  loginImageUrl: null,
  loginHeadline: null,
  loginSubheadline: null,
  useImageOnLogin: false,
  useImageOnDashboard: false,
  version: 2,
};

const renderComponent = (
  appearance: Partial<CompanyAppearance> = {},
  overrides: Partial<Parameters<typeof CompanyAppearanceSettingsComponent>[0]> = {},
) => {
  const props = {
    appearance: { ...defaults, ...appearance },
    onSave: jest.fn(),
    onUploadLoginImage: jest.fn(),
    onRemoveLoginImage: jest.fn(),
    saving: false,
    uploadingImage: false,
    removingImage: false,
    saveError: null,
    imageError: null,
    ...overrides,
  };

  render(<CompanyAppearanceSettingsComponent {...props} />);
  return props;
};

const saveButton = () => screen.getByRole("button", { name: /save changes/i });
const querySaveButton = () => screen.queryByRole("button", { name: /save changes/i });
const hexInput = () => screen.getByLabelText(/custom color/i);

describe("CompanyAppearanceSettingsComponent", () => {
  it("offers no Save or Cancel until something changes", () => {
    renderComponent();

    expect(querySaveButton()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Denim$/ }));

    expect(saveButton()).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("sends the picked preset by its name and trims empty copy to null", () => {
    const { onSave } = renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /^Denim$/ }));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith({
      accent: "denim",
      loginHeadline: null,
      loginSubheadline: null,
      useImageOnLogin: false,
      useImageOnDashboard: false,
      version: 2,
    });
  });

  it("stores Wine, the default, as nothing at all", () => {
    const { onSave } = renderComponent({ accent: "denim" });

    expect(screen.getByRole("button", { name: /^Denim$/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /^Wine$/ }));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ accent: null }));
  });

  it("accepts a hex typed without the leading hash", () => {
    const { onSave } = renderComponent();

    fireEvent.change(hexInput(), { target: { value: "16A34A" } });
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ accent: "#16a34a" }),
    );
  });

  it("blocks saving while the typed colour is not a valid hex", () => {
    renderComponent();

    // Something else has to be dirty first, or there would be no Save button to disable.
    fireEvent.click(screen.getByRole("button", { name: /^Denim$/ }));
    fireEvent.change(hexInput(), { target: { value: "not-a-colour" } });

    expect(screen.getByText(/enter a color as #rrggbb/i)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it("says so when a light custom color had to be adjusted for readability", () => {
    renderComponent();

    fireEvent.change(hexInput(), { target: { value: "#b5e61d" } });

    expect(screen.getByText("We adjusted your color for readability.")).toBeInTheDocument();
  });

  it("clearing the hex resets to the default rather than an invalid value", () => {
    const { onSave } = renderComponent({ accent: "#2563eb" });

    fireEvent.change(hexInput(), { target: { value: "" } });
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ accent: null }));
  });

  it("keeps the draft color inside the preview instead of repainting the page", () => {
    renderComponent();

    const preview = () => screen.getByTestId("appearance-preview");
    expect(preview()).toHaveAttribute("data-accent", "wine");

    fireEvent.click(screen.getByRole("button", { name: /^Denim$/ }));
    expect(preview()).toHaveAttribute("data-accent", "denim");
    expect(document.documentElement).not.toHaveAttribute("data-accent", "denim");

    fireEvent.change(hexInput(), { target: { value: "#123456" } });
    expect(preview()).not.toHaveAttribute("data-accent");
    expect(preview().style.getPropertyValue("--accent-base")).toBe("#123456");
  });

  it("cancel returns every field to the saved state", () => {
    renderComponent({ accent: "#2563eb" });

    fireEvent.click(screen.getByRole("button", { name: /^Raspberry$/ }));
    expect(saveButton()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(querySaveButton()).not.toBeInTheDocument();
    expect(hexInput()).toHaveValue("#2563eb");
  });

  it("keeps the image placement switches off-limits until an image exists", () => {
    renderComponent();

    expect(screen.getByLabelText(/use as login background/i)).toBeDisabled();
    expect(screen.getByLabelText(/use as company dashboard background/i)).toBeDisabled();
  });

  it("sends the placement switches with the rest of the draft", () => {
    const { onSave } = renderComponent({
      loginImageUrl: "http://api.test/uploads/c/u/splash.png",
    });

    fireEvent.click(screen.getByLabelText(/use as company dashboard background/i));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ useImageOnDashboard: true }),
    );
  });

  it("offers replace and remove once an image exists", () => {
    const { onRemoveLoginImage } = renderComponent({
      loginImageUrl: "http://api.test/uploads/c/u/splash.png",
    });

    expect(screen.getByRole("button", { name: /replace image/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));

    expect(onRemoveLoginImage).toHaveBeenCalled();
  });

  it("offers only upload while no image exists", () => {
    renderComponent();

    expect(screen.getByRole("button", { name: /upload image/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^remove$/i })).not.toBeInTheDocument();
  });
});
