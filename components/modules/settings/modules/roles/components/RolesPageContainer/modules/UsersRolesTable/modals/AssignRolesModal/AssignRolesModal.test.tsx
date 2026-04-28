import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { AssignRolesModal } from "./AssignRolesModal";

const mockAssignRolesForm = jest.fn();

let mockedFormSubmission = {
  roleIds: ["role-1", "role-2"],
};

jest.mock("../AssignRolesForm/AssignRolesForm", () => ({
  AssignRolesForm: (props: any) => {
    mockAssignRolesForm(props);

    return (
      <div>
        <input
          aria-label="Mock roles input"
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
          Apply
        </button>
      </div>
    );
  },
}));

const user = {
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  status: "ACTIVE",
  roles: [{ id: "role-1", name: "Admin" }],
} as any;

const allRoles = [
  {
    id: "role-1",
    name: "Admin",
    systemOwner: false,
  },
  {
    id: "role-2",
    name: "HR",
    systemOwner: true,
  },
] as any;

const renderModal = (
  props?: Partial<ComponentProps<typeof AssignRolesModal>>,
) => {
  const defaultProps: ComponentProps<typeof AssignRolesModal> = {
    isOpen: true,
    isLoading: false,
    user,
    allRoles,
    onCancelAction: jest.fn(),
    onApplyAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<AssignRolesModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("AssignRolesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      roleIds: ["role-1", "role-2"],
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /manage assigned roles/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/select which roles should be assigned to this user/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/mock roles input/i)).toBeInTheDocument();
  });

  it("passes props to form", () => {
    renderModal({ isLoading: true });

    expect(mockAssignRolesForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        user,
        allRoles,
      }),
    );

    expect(screen.getByLabelText(/mock roles input/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
  });

  it("calls apply action from form submit", () => {
    const onApplyAction = jest.fn();

    renderModal({ onApplyAction });

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApplyAction).toHaveBeenCalledWith("user-1", [
      "role-1",
      "role-2",
    ]);
  });

  it("does not call apply action when user is null", () => {
    const onApplyAction = jest.fn();

    renderModal({
      user: null,
      onApplyAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApplyAction).not.toHaveBeenCalled();
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

    fireEvent.change(screen.getByLabelText(/mock roles input/i), {
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

    fireEvent.change(screen.getByLabelText(/mock roles input/i), {
      target: { value: "changed" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /manage assigned roles/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/mock roles input/i), {
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
