import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { AddRoleRuleModal } from "./AddRoleRuleModal";

const mockAddRoleRuleForm = jest.fn();

let mockedFormSubmission = {
  type: "include",
  query: "",
  users: [
    {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
  ],
};

jest.mock("../AddRoleRuleForm/AddRoleRuleForm", () => ({
  AddRoleRuleForm: (props: any) => {
    mockAddRoleRuleForm(props);

    return (
      <div>
        <input
          aria-label="Rule name"
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
          Add rule
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof AddRoleRuleModal>>,
) => {
  const defaultProps: ComponentProps<typeof AddRoleRuleModal> = {
    isOpen: true,
    isLoading: false,
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<AddRoleRuleModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("AddRoleRuleModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      type: "include",
      query: "",
      users: [
        {
          id: "user-1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      ],
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /add role rule/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/choose a rule type on the left/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/rule name/i)).toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockAddRoleRuleForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/rule name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /add rule/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      type: "include",
      userIds: ["user-1"],
    });
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

    fireEvent.change(screen.getByLabelText(/rule name/i), {
      target: { value: "changed" },
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

    fireEvent.change(screen.getByLabelText(/rule name/i), {
      target: { value: "changed" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /add role rule/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/rule name/i), {
      target: { value: "changed" },
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
