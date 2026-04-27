import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CreateGroupModal } from "./CreateGroupModal";

const mockCreateGroupForm = jest.fn();

jest.mock(
  "@/components/modules/settings/modules/attributes/components/AttributeGroup/CreateGroupForm",
  () => ({
    CreateGroupForm: (props: any) => {
      mockCreateGroupForm(props);

      return (
        <div>
          <input
            aria-label="Group name"
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
                name: "HR",
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
  props?: Partial<ComponentProps<typeof CreateGroupModal>>,
) => {
  const defaultProps: ComponentProps<typeof CreateGroupModal> = {
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
    ...render(<CreateGroupModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateGroupModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /create attribute group/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create a new section to organize attributes/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /create attribute group/i }),
    ).not.toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockCreateGroupForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/group name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "HR",
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

    fireEvent.change(screen.getByLabelText(/group name/i), {
      target: { value: "HR" },
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

    fireEvent.change(screen.getByLabelText(/group name/i), {
      target: { value: "HR" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /create attribute group/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/group name/i), {
      target: { value: "HR" },
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
