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

// The real Select renders through a portal; a plain <select> keeps the assertions readable. They
// are told apart by position (folder, visibility, category — the order they are rendered in) — a
// label baked into the mock would have to be recomputed on every re-render, which is a race, not
// a fixture.
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

const folderSelect = () => screen.getAllByRole("combobox")[0];
const visibilitySelect = () => screen.getAllByRole("combobox")[1];
const categorySelect = () => screen.getAllByRole("combobox")[2];

const folders = [
  { id: "folder-1", name: "Contracts" },
  { id: "folder-2", name: "Payslips" },
];

const categories = [
  { id: "category-1", name: "Employment" },
];

const file = new File(["content"], "contract.pdf", { type: "application/pdf" });
const secondFile = new File(["more"], "payslip.pdf", { type: "application/pdf" });

const longFile = new File(
  ["content"],
  "573100011_840662625139539_2498625148756301642_n_extra_extra_extra.jpg",
  { type: "image/jpeg" },
);

function getUploadZone() {
  return screen.getByText(/drag files here to upload/i).closest('[role="button"]')!;
}

function getActiveUploadZone() {
  return screen.getByText(/drop files to upload/i).closest('[role="button"]')!;
}

function getInnerButton(name: RegExp) {
  return screen.getByText(name).closest("button")!;
}

function renderForm(props: Partial<React.ComponentProps<typeof UploadDocumentForm>> = {}) {
  return render(
    <UploadDocumentForm
      folders={folders}
      defaultFolderId="folder-1"
      onCancelAction={jest.fn()}
      onSubmitAction={jest.fn()}
      {...props}
    />,
  );
}

describe("UploadDocumentForm", () => {
  it("renders form content", () => {
    renderForm();

    expect(screen.getByLabelText(/^files$/i)).toBeInTheDocument();
    expect(screen.getByText(/drag files here to upload/i)).toBeInTheDocument();
    expect(getInnerButton(/^choose files$/i)).toBeInTheDocument();
    expect(folderSelect()).toHaveValue("folder-1");
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("hides the category picker when the company has none", () => {
    renderForm();

    // Folder and visibility remain; the category picker is the only conditional one.
    expect(screen.queryAllByRole("combobox")).toHaveLength(2);
  });

  it("submits the chosen visibility", async () => {
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });
    fireEvent.change(visibilitySelect(), { target: { value: "VISIBLE_TO_EMPLOYEE" } });
    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

    await waitFor(() => expect(onSubmitAction).toHaveBeenCalledTimes(1));

    expect(onSubmitAction.mock.calls[0][0].visibility).toBe("VISIBLE_TO_EMPLOYEE");
  });

  it("shows selected file after file input change", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeEnabled();
  });

  it("queues several files and labels the submit with the count", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^files$/i), {
      target: { files: [file, secondFile] },
    });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByText("payslip.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload 2 files/i })).toBeEnabled();
  });

  it("does not queue the same file twice", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });

    expect(screen.getAllByText("contract.pdf")).toHaveLength(1);
  });

  it("shortens a long file name and keeps the full name in the title", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [longFile] } });

    const fileName = screen.getByTitle(longFile.name);

    expect(fileName).toHaveTextContent(
      /^573100011_840662625139539_2498625148756301642_n_e\.\.\.\.jpg$/,
    );
  });

  it("removes a queued file", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /remove contract\.pdf/i }));

    expect(screen.queryByText("contract.pdf")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("shows active drag state", () => {
    renderForm();

    fireEvent.dragOver(getUploadZone());

    expect(screen.getByText(/drop files to upload/i)).toBeInTheDocument();

    fireEvent.dragLeave(getActiveUploadZone());

    expect(screen.getByText(/drag files here to upload/i)).toBeInTheDocument();
  });

  it("accepts files by drag and drop", () => {
    renderForm();

    fireEvent.drop(getUploadZone(), { dataTransfer: { files: [file, secondFile] } });

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByText("payslip.pdf")).toBeInTheDocument();
  });

  it("submits the queued files and the default folder", async () => {
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

    await waitFor(() => expect(onSubmitAction).toHaveBeenCalledTimes(1));

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      files: [file],
      folderId: "folder-1",
      categoryId: undefined,
      visibility: "HR_ONLY",
    });
  });

  it("submits undefined folder for root", async () => {
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });
    fireEvent.change(folderSelect(), { target: { value: "root" } });
    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

    await waitFor(() => expect(onSubmitAction).toHaveBeenCalledTimes(1));

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      files: [file],
      folderId: undefined,
      categoryId: undefined,
      visibility: "HR_ONLY",
    });
  });

  it("submits the chosen category", async () => {
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction, categories });

    fireEvent.change(screen.getByLabelText(/^files$/i), { target: { files: [file] } });
    fireEvent.change(categorySelect(), { target: { value: "category-1" } });
    fireEvent.click(screen.getByRole("button", { name: /^upload$/i }));

    await waitFor(() => expect(onSubmitAction).toHaveBeenCalledTimes(1));

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      files: [file],
      folderId: "folder-1",
      categoryId: "category-1",
      visibility: "HR_ONLY",
    });
  });

  it("shows a validation error when submitting with nothing queued", async () => {
    renderForm();

    fireEvent.submit(screen.getByRole("button", { name: /^upload$/i }).closest("form")!);

    expect(
      await screen.findByText(/please choose at least one file/i),
    ).toBeInTheDocument();
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    renderForm({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    renderForm({ isLoading: true });

    expect(screen.getByLabelText(/^files$/i)).toBeDisabled();
    expect(folderSelect()).toBeDisabled();
    expect(getInnerButton(/^choose files$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });
});
