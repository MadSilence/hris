import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AddRoleForm } from "./AddRoleForm";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
  };
});

const templates = [
  {
    id: "admin",
    name: "Admin",
    description: "Admin permissions",
  },
  {
    id: "hr",
    name: "HR",
    description: "HR permissions",
  },
];

describe("AddRoleForm", () => {
  it("submits blank role", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "HR Manager" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        useTemplate: false,
        name: "HR Manager",
        templateId: "",
        templateName: "",
      });
    });
  });

  it("shows validation error for short blank role name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "A" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(
      await screen.findByText(/role name must be at least 2 characters/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("submits role from template", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("switch"));

    fireEvent.change(screen.getByLabelText(/role name optional/i), {
      target: { value: "Custom Admin" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        useTemplate: true,
        name: "",
        templateId: "admin",
        templateName: "Custom Admin",
      });
    });
  });

  it("submits role from template with empty optional name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        useTemplate: true,
        name: "",
        templateId: "admin",
        templateName: "",
      });
    });
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "HR" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <AddRoleForm
        templates={templates}
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <AddRoleForm
        isLoading
        templates={templates}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/role name/i)).toBeDisabled();
    expect(screen.getByRole("switch")).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
