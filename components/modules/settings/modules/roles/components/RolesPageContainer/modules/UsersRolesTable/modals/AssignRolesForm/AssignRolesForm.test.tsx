import { partialMock } from "@/test/types";
import type { Role } from "@/models/role/Role";
import type { AssignRolesTarget } from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesForm/AssignRolesForm";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AssignRolesForm } from "./AssignRolesForm";

// AssignRolesForm reads the caller's access (to gate the System Owner role); the real hook
// needs a QueryClient, so stub it as a System Owner so these form-behaviour tests can freely
// toggle every role (owner gating is not what they exercise).
jest.mock("@/components/auth/useAccess", () => ({
  useAccess: () => ({ access: { systemOwner: true } }),
}));

// The resolved-access tabs query the backend through react-query; these tests cover the role
// picker, so the preview is stubbed rather than dragging a QueryClient into every render.
jest.mock("@/components/modules/settings/modules/roles/hooks/useRoleAccessPreview", () => ({
  useRoleAccessPreview: () => ({ data: undefined, isLoading: false }),
}));

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

const user = partialMock<AssignRolesTarget>({
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  status: "ACTIVE",
  roles: [{ id: "role-1", name: "Admin" }],
});

const allRoles: Role[] = [
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
] as Role[];

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
