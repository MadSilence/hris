import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AddRoleRuleForm } from "./AddRoleRuleForm";

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

const users = [
  {
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  },
  {
    id: "user-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
  },
];

jest.mock(
  "@/components/modules/organization/modules/profile/hooks/useDebouncedValue",
  () => ({
    useDebouncedValue: (value: string) => value,
  }),
);

jest.mock("@/components/modules/organization/hooks/usePeopleSearch", () => ({
  usePeopleSearch: () => ({
    data: {
      items: users,
    },
    isLoading: false,
    error: null,
  }),
}));

describe("AddRoleRuleForm", () => {
  it("renders form content", () => {
    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/rule type/i)).toBeInTheDocument();
    expect(screen.getByText(/always include/i)).toBeInTheDocument();
    expect(screen.getByText(/always exclude/i)).toBeInTheDocument();
    expect(screen.getByText(/condition based rule/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search users/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when no user selected", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

    expect(
      await screen.findByText(/please select at least one user/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("adds user and submits include rule", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /add/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        type: "include",
        query: "",
        users: [users[0]],
      });
    });
  });

  it("removes selected user", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /add/i })[0]);

    expect(screen.getByText(/selected users/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

    expect(
      await screen.findByText(/please select at least one user/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("submits exclude rule", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByText(/always exclude/i));
    fireEvent.click(screen.getAllByRole("button", { name: /add/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        type: "exclude",
        query: "",
        users: [users[0]],
      });
    });
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search users/i), {
      target: { value: "john" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <AddRoleRuleForm
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    render(
      <AddRoleRuleForm
        isLoading
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(/search users/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /add rule/i })).toBeDisabled();
  });
});
