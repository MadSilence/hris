import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { CreateLegalEntityModal } from "./CreateLegalEntityModal";

const mockCreateLegalEntityForm = jest.fn();

let mockedFormSubmission = {
  name: "Acme LLC",
  description: "",
  registrationNumber: "REG-123",
  taxId: "TAX-123",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
};

jest.mock("../CreateLegalEntityForm", () => ({
  CreateLegalEntityForm: (props: any) => {
    mockCreateLegalEntityForm(props);

    return (
      <div>
        <input
          aria-label="Legal entity name"
          onChange={() => props.onDirtyChangeAction?.(true)}
          disabled={props.isLoading}
        />

        <button
          type="button"
          disabled={props.isLoading}
          onClick={props.onCancelAction}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={() => props.onSubmitAction(mockedFormSubmission)}
        >
          Create
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof CreateLegalEntityModal>>,
) => {
  const defaultProps: ComponentProps<typeof CreateLegalEntityModal> = {
    isOpen: true,
    isLoading: false,
    onConfirmAction: jest.fn(),
    onCancelAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<CreateLegalEntityModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateLegalEntityModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      name: "Acme LLC",
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

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /create legal entity/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create a legal entity and fill in its registration details/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/legal entity name/i)).toBeInTheDocument();
  });

  it("passes props to form", () => {
    const initialValues = {
      name: "Initial LLC",
    };

    renderModal({
      isLoading: true,
      initialValues,
    });

    expect(mockCreateLegalEntityForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        initialValues,
      }),
    );

    expect(screen.getByLabelText(/legal entity name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onConfirmAction).toHaveBeenCalledWith(mockedFormSubmission);
  });

  it("closes by Cancel when form is not dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("opens confirm cancel modal on Cancel when form is dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/legal entity name/i), {
      target: { value: "Acme LLC" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
  });

  it("keeps modal open when confirm cancel is cancelled", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/legal entity name/i), {
      target: { value: "Acme LLC" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /create legal entity/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/legal entity name/i), {
      target: { value: "Acme LLC" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("does not close while loading", () => {
    const onCancelAction = jest.fn();

    renderModal({
      isLoading: true,
      onCancelAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });
});
