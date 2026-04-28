import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AssignRolesForm } from "./AssignRolesForm";

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class ResizeObserver {
      observe() {
      }

      unobserve() {
      }

      disconnect() {
      }
    },
  });
});

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

describe("AssignRolesForm", () => {
  it("renders user and roles", () => {
    render(
      <AssignRolesForm
        user={user}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/hr/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });

  it("renders empty roles state", () => {
    render(
      <AssignRolesForm
        user={user}
        allRoles={[]}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/no roles available/i)).toBeInTheDocument();
  });

  it("calls cancel action when unchanged", () => {
    const onCancelAction = jest.fn();

    render(
      <AssignRolesForm
        user={user}
        allRoles={allRoles}
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("enables apply after role change and submits role ids", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AssignRolesForm
        user={user}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();

    fireEvent.click(screen.getByText(/hr/i));

    expect(screen.getByRole("button", { name: /apply/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      roleIds: ["role-1", "role-2"],
    });
  });

  it("shows reset button after changes and resets values", async () => {
    render(
      <AssignRolesForm
        user={user}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/hr/i));

    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
    });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <AssignRolesForm
        user={user}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/hr/i));

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("disables actions while loading", () => {
    render(
      <AssignRolesForm
        isLoading
        user={user}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
  });

  it("disables apply when user is null", () => {
    render(
      <AssignRolesForm
        user={null}
        allRoles={allRoles}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/hr/i));

    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
  });
});
