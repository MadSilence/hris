import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { UploadDocumentForm } from "./UploadDocumentForm";

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
      aria-label="Folder"
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

const file = new File(["content"], "contract.pdf", {
  type: "application/pdf",
});

describe("UploadDocumentForm", () => {
  it("renders form content", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^file$/i)).toBeInTheDocument();
    expect(screen.getByText(/choose file from device/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^folder$/i)).toHaveValue("folder-1");
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("submits selected file and default folder", async () => {
    const onSubmitAction = jest.fn();

    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/file/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /upload/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      file,
      folderId: "folder-1",
    });
  });

  it("submits undefined folder for root", async () => {
    const onSubmitAction = jest.fn();

    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/file/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.change(screen.getByLabelText(/folder/i), {
      target: {
        value: "root",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /upload/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      file,
      folderId: undefined,
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <UploadDocumentForm
        isLoading
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/file/i)).toBeDisabled();
    expect(screen.getByLabelText(/folder/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });
});
