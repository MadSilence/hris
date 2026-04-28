import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { LegalEntityDetailsModal } from "./LegalEntityDetailsModal";

const mockLegalEntityDetailsForm = jest.fn();

let mockedFormSubmission = {
  name: "Acme Updated",
  description: "",
  registrationNumber: "REG-123",
  taxId: "TAX-123",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
};

jest.mock("../LegalEntityDetailsForm/LegalEntityDetailsForm", () => ({
  LegalEntityDetailsForm: (props: any) => {
    mockLegalEntityDetailsForm(props);

    return (
      <div>
        <input
          aria-label="Legal entity name"
          onChange={() => props.onDirtyChangeAction?.(true)}
          disabled={props.isLoading}
        />

        <button type="button" disabled={props.isLoading} onClick={props.onCancelAction}>
          Cancel
        </button>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={() => props.onSubmitAction(mockedFormSubmission)}
        >
          Save
        </button>
      </div>
    );
  },
}));

jest.mock(
  "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsView",
  () => ({
    __esModule: true,
    default: ({ legalEntity }: any) => (
      <div>Details view: {legalEntity.name}</div>
    ),
    LegalEntityDetailsView: ({ legalEntity }: any) => (
      <div>Details view: {legalEntity.name}</div>
    ),
  }),
);

jest.mock("@/public/icons/trash.svg", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} />,
}));

jest.mock(
  "@/components/modules/settings/modules/legalEntity/components/DeleteLegalEntityModal",
  () => ({
    DeleteLegalEntityModal: ({
      isOpen,
      onConfirmAction,
      onRequestCloseAction,
    }: any) =>
      isOpen ? (
        <div role="dialog" aria-label="Delete legal entity">
          <button onClick={onRequestCloseAction}>Cancel delete</button>
          <button onClick={onConfirmAction}>Confirm delete</button>
        </div>
      ) : null,
  }),
);

const entity = {
  id: "entity-1",
  name: "Acme LLC",
  description: "",
  registrationNumber: "REG-123",
  taxId: "TAX-123",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
} as any;

const renderModal = (
  props?: Partial<ComponentProps<typeof LegalEntityDetailsModal>>,
) => {
  const defaultProps: ComponentProps<typeof LegalEntityDetailsModal> = {
    isOpen: true,
    isLoading: false,
    isDeleteLoading: false,
    entity,
    onCancelAction: jest.fn(),
    onDeleteAction: jest.fn(),
    onSaveAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<LegalEntityDetailsModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("LegalEntityDetailsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      name: "Acme Updated",
      description: "",
      registrationNumber: "REG-123",
      taxId: "TAX-123",
      country: "Poland",
      city: "Warsaw",
      street: "",
      building: "",
      postCode: "",
    };
  });

  it("renders details view", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /legal entity/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/details view: acme llc/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("switches to edit mode and passes props to form", () => {
    renderModal({ isLoading: true });

    expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();

    renderModal({ isLoading: false });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(mockLegalEntityDetailsForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: false,
        initialValues: expect.objectContaining({
          name: "Acme LLC",
          registrationNumber: "REG-123",
        }),
      }),
    );

    expect(screen.getByLabelText(/legal entity name/i)).toBeInTheDocument();
  });

  it("calls save action from form submit", () => {
    const onSaveAction = jest.fn();

    renderModal({ onSaveAction });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSaveAction).toHaveBeenCalledWith(mockedFormSubmission);
  });

  it("cancels edit mode", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText(/details view: acme llc/i)).toBeInTheDocument();
  });

  it("opens delete modal and confirms delete", () => {
    const onDeleteAction = jest.fn();

    renderModal({ onDeleteAction });

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/confirm delete/i));

    expect(onDeleteAction).toHaveBeenCalledTimes(1);
  });
});
