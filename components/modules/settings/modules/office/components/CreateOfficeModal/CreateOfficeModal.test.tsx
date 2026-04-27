import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CreateOfficeModal } from "./CreateOfficeModal";

const mockCreateOfficeForm = jest.fn();

jest.mock(
  "@/components/modules/settings/modules/office/components/CreateOfficeForm",
  () => ({
    CreateOfficeForm: (props: any) => {
      mockCreateOfficeForm(props);

      return (
        <div>
          <input
            aria-label="Office name"
            disabled={props.isLoading}
            onChange={() => props.onDirtyChangeAction?.(true)}
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
            onClick={() =>
              props.onSubmitAction({
                name: "London HQ",
                description: "",
                email: "",
                phone: "",
                country: "United Kingdom",
                city: "London",
                street: "",
                building: "",
                postCode: "",
              })
            }
          >
            Create
          </button>
        </div>
      );
    },
  }),
);

const renderModal = (
  props?: Partial<ComponentProps<typeof CreateOfficeModal>>,
) => {
  const defaultProps: ComponentProps<typeof CreateOfficeModal> = {
    isOpen: true,
    isLoading: false,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<CreateOfficeModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateOfficeModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /create office/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/add office details and address information/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/office name/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /create office/i }),
    ).not.toBeInTheDocument();
  });

  it("passes loading and initial values to form", () => {
    renderModal({
      isLoading: true,
      initialValues: {
        name: "London HQ",
      },
    });

    expect(mockCreateOfficeForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        initialValues: {
          name: "London HQ",
        },
      }),
    );

    expect(screen.getByLabelText(/office name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "London HQ",
      description: "",
      email: "",
      phone: "",
      country: "United Kingdom",
      city: "London",
      street: "",
      building: "",
      postCode: "",
    });
  });

  it("closes by Cancel when form is not dirty", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("opens confirm cancel modal on Cancel when form is dirty", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/office name/i), {
      target: { value: "London HQ" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();
  });

  it("keeps modal open when confirm cancel is cancelled", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/office name/i), {
      target: { value: "London HQ" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /create office/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/office name/i), {
      target: { value: "London HQ" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("does not close while loading", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({
      isLoading: true,
      onRequestCloseAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });
});
