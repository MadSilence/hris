import { fireEvent, render, screen } from "@testing-library/react";
import { CreateAttributeModal } from "./CreateAttributeModal";
import { ComponentProps } from "react";

const mockCreateAttributeForm = jest.fn();

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeForm",
  () => ({
    CreateAttributeForm: (props: any) => {
      mockCreateAttributeForm(props);

      return (
        <div>
          <input
            aria-label="Attribute name"
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
            onClick={() =>
              props.onSubmitAction({
                name: "Salary",
                type: "TEXT",
                unique: false,
                decScale: null,
                dateHideYearPublic: false,
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
  props?: Partial<ComponentProps<typeof CreateAttributeModal>>,
) => {
  const defaultProps: ComponentProps<typeof CreateAttributeModal> = {
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
    ...render(<CreateAttributeModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateAttributeModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /create attribute/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create a custom attribute for your data model/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/attribute name/i)).toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockCreateAttributeForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/attribute name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "Salary",
      type: "TEXT",
      unique: false,
      decScale: null,
      dateHideYearPublic: false,
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

    fireEvent.change(screen.getByLabelText(/attribute name/i), {
      target: { value: "Salary" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/you have unsaved changes/i),
    ).toBeInTheDocument();
  });

  it("keeps modal open when confirm cancel is cancelled", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/attribute name/i), {
      target: { value: "Salary" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /create attribute/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/attribute name/i), {
      target: { value: "Salary" },
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
