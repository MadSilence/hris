import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MoveDocumentForm } from "./MoveDocumentForm";

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

  Object.defineProperty(Element.prototype, "scrollIntoView", {
    writable: true,
    configurable: true,
    value: jest.fn(),
  });
});

jest.mock("@/public/desact/src/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <select
      aria-label="Destination folder"
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange(e.currentTarget.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

const folders = [
  {
    id: "folder-1",
    name: "Contracts",
  },
  {
    id: "folder-2",
    name: "Payslips",
  },
];

describe("MoveDocumentForm", () => {
  it("renders form content", () => {
    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/destination folder/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^move$/i })).toBeDisabled();
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    render(
      <MoveDocumentForm
        isLoading
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/destination folder/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^move$/i })).toBeDisabled();
  });

  it("submits selected folder", async () => {
    const onSubmitAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/destination folder/i), {
      target: { value: "folder-2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^move$/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      folderId: "folder-2",
    });
  });

  it("submits undefined for root folder", async () => {
    const onSubmitAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/destination folder/i), {
      target: { value: "root" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^move$/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      folderId: undefined,
    });
  });
});
