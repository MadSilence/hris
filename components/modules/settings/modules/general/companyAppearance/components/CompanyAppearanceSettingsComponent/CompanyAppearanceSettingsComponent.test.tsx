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
const hexInput = () => screen.getByLabelText(/custom colour/i);

describe("CompanyAppearanceSettingsComponent", () => {
  it("cannot be saved until something changes", () => {
    renderComponent();

    expect(saveButton()).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));

    expect(saveButton()).toBeEnabled();
  });

  it("sends the picked preset colour and trims empty copy to null", () => {
    const { onSave } = renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));
    fireEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith({
      brandColor: "#2563eb",
      loginHeadline: null,
      loginSubheadline: null,
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

  it("previews the draft colour by overriding the palette on the page", () => {
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

    expect(container.querySelector("style[data-brand-theme-preview]")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Blue$/ }));

    const style = container.querySelector("style[data-brand-theme-preview]");
    expect(style?.innerHTML).toContain("--brown-600:");
  });

  it("reset returns every field to the saved state", () => {
    renderComponent({ brandColor: "#2563eb" });

    fireEvent.click(screen.getByRole("button", { name: /^Rose$/ }));
    expect(saveButton()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(saveButton()).toBeDisabled();
    expect(hexInput()).toHaveValue("#2563eb");
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
