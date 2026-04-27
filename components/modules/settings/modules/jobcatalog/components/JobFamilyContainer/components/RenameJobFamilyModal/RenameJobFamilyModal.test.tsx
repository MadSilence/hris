import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RenameJobFamilyModal } from "./RenameJobFamilyModal";

const mockRenameJobFamilyForm = jest.fn();

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/RenameJobFamilyForm/RenameJobFamilyForm",
  () => ({
    RenameJobFamilyForm: (props: any) => {
      mockRenameJobFamilyForm(props);

      return (
        <div>
          <input
            aria-label="Job family name"
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
                name: "Engineering",
              })
            }
          >
            Save
          </button>
        </div>
      );
    },
  }),
);

const renderModal = (
  props?: Partial<ComponentProps<typeof RenameJobFamilyModal>>,
) => {
  const defaultProps: ComponentProps<typeof RenameJobFamilyModal> = {
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
    ...render(<RenameJobFamilyModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("RenameJobFamilyModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /rename job family/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/update the job family name used to organize jobs/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/job family name/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /rename job family/i }),
    ).not.toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockRenameJobFamilyForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/job family name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "Engineering",
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

    fireEvent.change(screen.getByLabelText(/job family name/i), {
      target: { value: "Engineering" },
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

    fireEvent.change(screen.getByLabelText(/job family name/i), {
      target: { value: "Engineering" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /rename job family/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.change(screen.getByLabelText(/job family name/i), {
      target: { value: "Engineering" },
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
