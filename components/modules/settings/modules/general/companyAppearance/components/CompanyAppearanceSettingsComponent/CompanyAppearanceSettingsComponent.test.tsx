import { fireEvent, render, screen } from "@testing-library/react";

import { CompanyAppearanceSettingsComponent } from "./CompanyAppearanceSettingsComponent";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";

jest.mock("@/components/layout/SettingsPageHeader/SettingsPageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const defaults: CompanyAppearance = {
  brandColor: null,
  loginImageUrl: null,
  loginHeadline: null,
  loginSubheadline: null,
  useImageOnLogin: false,
  useImageOnDashboard: false,
  sidebarContrast: false,
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
const hexInput = () => screen.getByLabelText(/custom colour/i);

describe("CompanyAppearanceSettingsComponent", () => {
  it("offers no Save or Cancel until something changes", () => {
    renderComponent();

    expect(querySaveButton()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));

    expect(saveButton()).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("sends the picked preset colour and trims empty copy to null", () => {
    const { onSave } = renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith({
      brandColor: "#2563eb",
      loginHeadline: null,
      loginSubheadline: null,
      useImageOnLogin: false,
      useImageOnDashboard: false,
      sidebarContrast: false,
    });
  });

  it("accepts a hex typed without the leading hash", () => {
    const { onSave } = renderComponent();

    fireEvent.change(hexInput(), { target: { value: "16A34A" } });
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ brandColor: "#16a34a" }),
    );
  });

  it("blocks saving while the typed colour is not a valid hex", () => {
    renderComponent();

    // Something else has to be dirty first, or there would be no Save button to disable.
    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));
    fireEvent.change(hexInput(), { target: { value: "not-a-colour" } });

    expect(screen.getByText(/enter a hex colour/i)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it("clearing the hex resets to the default palette rather than an invalid value", () => {
    const { onSave } = renderComponent({ brandColor: "#2563eb" });

    fireEvent.change(hexInput(), { target: { value: "" } });
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ brandColor: null }));
  });

  it("keeps the draft colour inside the preview instead of repainting the page", () => {
    const { container } = render(
      <CompanyAppearanceSettingsComponent
        appearance={defaults}
        onSave={jest.fn()}
        onUploadLoginImage={jest.fn()}
        onRemoveLoginImage={jest.fn()}
        saving={false}
        uploadingImage={false}
        removingImage={false}
        saveError={null}
        imageError={null}
      />,
    );

    const sheetOf = () =>
      container.querySelector("style[data-brand-theme-preview]")?.innerHTML ?? "";

    const shipped = sheetOf();
    expect(shipped).toContain("[data-appearance-preview]{");
    expect(shipped).not.toContain("html:root");

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));

    const drafted = sheetOf();
    expect(drafted).toContain("[data-appearance-preview]{");
    expect(drafted).toContain("--brown-600:");
    expect(drafted).not.toEqual(shipped);
  });

  it("cancel returns every field to the saved state", () => {
    renderComponent({ brandColor: "#2563eb" });

    fireEvent.click(screen.getByRole("button", { name: /^Rose$/ }));
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

  it("sends the placement and sidebar switches with the rest of the draft", () => {
    const { onSave } = renderComponent({
      loginImageUrl: "http://api.test/uploads/c/u/splash.png",
    });

    fireEvent.click(screen.getByLabelText(/use as company dashboard background/i));
    fireEvent.click(screen.getByLabelText(/make sidebar contrast/i));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ useImageOnDashboard: true, sidebarContrast: true }),
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
