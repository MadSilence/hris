import type { ReactNode } from "react";
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
    children: ReactNode;
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
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: ReactNode;
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

const longFile = new File(
  ["content"],
  "573100011_840662625139539_2498625148756301642_n_extra_extra_extra.jpg",
  {
    type: "image/jpeg",
  },
);

function getUploadZone() {
  return screen
    .getByText(/drag file here to upload/i)
    .closest('[role="button"]')!;
}

function getActiveUploadZone() {
  return screen
    .getByText(/drop file to upload/i)
    .closest('[role="button"]')!;
}

function getInnerButton(name: RegExp) {
  return screen.getByText(name).closest("button")!;
}

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
    expect(screen.getByText(/drag file here to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse files/i)).toBeInTheDocument();

    expect(
      screen.getByText(/supports pdf, doc, jpg, png files up to 10mb/i),
    ).toBeInTheDocument();

    expect(getInnerButton(/^choose file$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^folder$/i)).toHaveValue("folder-1");
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("shows selected file after file input change", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^file$/i), {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByText("7 B")).toBeInTheDocument();
    expect(getInnerButton(/^choose another$/i)).toBeInTheDocument();
    expect(getInnerButton(/^remove$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeEnabled();
  });

  it("shortens long selected file name and keeps full name in title", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^file$/i), {
      target: {
        files: [longFile],
      },
    });

    const fileName = screen.getByTitle(longFile.name);

    expect(fileName).toBeInTheDocument();

    expect(fileName).toHaveTextContent(
      /^573100011_840662625139539_2498625148756301642_n_e\.\.\.\.jpg$/,
    );
  });

  it("removes selected file", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^file$/i), {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();

    fireEvent.click(getInnerButton(/^remove$/i));

    expect(screen.queryByText("contract.pdf")).not.toBeInTheDocument();
    expect(screen.getByText(/drag file here to upload/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("shows active drag state", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.dragOver(getUploadZone());

    expect(screen.getByText(/drop file to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/release to choose this file/i)).toBeInTheDocument();

    fireEvent.dragLeave(getActiveUploadZone());

    expect(screen.getByText(/drag file here to upload/i)).toBeInTheDocument();
  });

  it("selects file by drag and drop", () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.drop(getUploadZone(), {
      dataTransfer: {
        files: [file],
      },
    });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeEnabled();
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

    fireEvent.change(screen.getByLabelText(/^file$/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

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

    fireEvent.change(screen.getByLabelText(/^file$/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.change(screen.getByLabelText(/^folder$/i), {
      target: {
        value: "root",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      file,
      folderId: undefined,
    });
  });

  it("shows validation error when submitting without file", async () => {
    render(
      <UploadDocumentForm
        folders={folders}
        defaultFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /^upload$/i }).closest("form")!,
    );

    expect(await screen.findByText(/please choose a file/i)).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

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

    expect(screen.getByLabelText(/^file$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^folder$/i)).toBeDisabled();
    expect(getInnerButton(/^choose file$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });
});
