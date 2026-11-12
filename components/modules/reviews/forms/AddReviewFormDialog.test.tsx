import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveReviewFormAction } from "@/components/modules/reviews/actions/reviewFormActions";
import type { ReviewForm } from "@/models/reviews";
import {
  useApplyTemplate,
  useTemplateApplication,
  useTemplatePreview,
  useTemplates,
} from "@/components/modules/settings/modules/templates/hooks";
import { partialMock } from "@/test/types";
import type {
  TemplateApplicationDTO, TemplateItemDTO, TemplatePartDTO, TemplatePreviewDTO, TemplateRecordedItem,
} from "@/api/modules/templates/dto";
import { AddReviewFormDialog } from "./AddReviewFormDialog";

jest.mock("@/components/modules/reviews/actions/reviewFormActions");
jest.mock("@/components/modules/settings/modules/templates/hooks");
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}));

const saveMock = saveReviewFormAction as jest.MockedFunction<typeof saveReviewFormAction>;
const templatesMock = useTemplates as jest.MockedFunction<typeof useTemplates>;
const previewMock = useTemplatePreview as jest.MockedFunction<typeof useTemplatePreview>;
const applyMock = useApplyTemplate as jest.MockedFunction<typeof useApplyTemplate>;
const applicationMock = useTemplateApplication as jest.MockedFunction<typeof useTemplateApplication>;
const mutateAsync = jest.fn();

const selfTemplate = {
  key: "review-form-self", version: 1, kind: "REVIEW_FORM" as const, title: "Self review",
  summary: "Look back over the period.", changelog: null, itemCount: 5, suggested: false,
  appliedVersion: null, appliedAt: null,
};

const previewOf = (finalName: string, extra: Partial<TemplateItemDTO> = {}): TemplatePreviewDTO => partialMock<TemplatePreviewDTO>({
  key: "review-form-self", fingerprint: "fp-1",
  parts: [partialMock<TemplatePartDTO>({
    key: "review-form-self",
    items: [partialMock<TemplateItemDTO>({
      ref: "form", type: "FORM", name: "Self review", finalName, outcome: "NEW", renameTaken: false, reason: null, ...extra,
    })],
  })],
});

beforeEach(() => {
  templatesMock.mockReturnValue(partialMock<ReturnType<typeof useTemplates>>({ data: [selfTemplate], isLoading: false }));
  previewMock.mockReturnValue(partialMock<ReturnType<typeof useTemplatePreview>>({ data: undefined, isLoading: false }));
  applicationMock.mockReturnValue(partialMock<ReturnType<typeof useTemplateApplication>>({ data: undefined }));
  mutateAsync.mockReset();
  applyMock.mockReturnValue(partialMock<ReturnType<typeof useApplyTemplate>>({ mutateAsync }));
});

const created: ReviewForm = {
  id: "form-1",
  name: "Self review",
  description: null,
  questions: [],
  archivedAt: null,
  updatedAt: "2026-11-03T10:00:00",
  version: 0,
};

const renderDialog = () => {
  const onClose = jest.fn();
  const onAdded = jest.fn();
  render(<AddReviewFormDialog open onCloseAction={onClose} onAddedAction={onAdded} />);
  return { onClose, onAdded };
};

describe("AddReviewFormDialog", () => {
  beforeEach(() => saveMock.mockReset());

  it("asks for a name before sending anything", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("Enter a name.")).toBeInTheDocument();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("creates an empty form under the trimmed name and hands it on", async () => {
    saveMock.mockResolvedValue({ status: ActionStatus.SUCCESS, data: created });
    const { onAdded } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "  Self review " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledWith(created));
    expect(saveMock).toHaveBeenCalledWith({ id: null, body: { name: "Self review", description: null, questions: [] } });
  });

  it("puts a taken name next to the field and stays open", async () => {
    saveMock.mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "A review form with this name already exists. Choose another name.",
      fieldErrors: { name: "A review form with this name already exists. Choose another name." },
    });
    const { onAdded } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Self review" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("already exists");
    expect(onAdded).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Name/)).toHaveValue("Self review");
  });
});

describe("AddReviewFormDialog from the library", () => {
  it("offers the library's forms beside a blank one", () => {
    renderDialog();
    expect(screen.getByRole("radio", { name: /Blank form/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Self review/ })).toHaveTextContent("Look back over the period.");
  });

  it("applies the chosen form with the preview's fingerprint and opens what it created", async () => {
    previewMock.mockReturnValue(partialMock<ReturnType<typeof useTemplatePreview>>({
      data: previewOf("Self review (template)"), isLoading: false,
    }));
    mutateAsync.mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "app-1" } });
    const { onAdded, rerender } = renderWithRerender();

    fireEvent.click(screen.getByRole("radio", { name: /Self review/ }));
    expect(screen.getByText(/already taken here/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ fingerprint: "fp-1" }));

    applicationMock.mockReturnValue(partialMock<ReturnType<typeof useTemplateApplication>>({
      data: partialMock<TemplateApplicationDTO>({ items: [partialMock<TemplateRecordedItem>({ type: "FORM", objectId: "form-9" })] }),
    }));
    rerender();
    await waitFor(() => expect(onAdded).toHaveBeenCalledWith({ id: "form-9" }));
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("does not add while the library's name is taken twice", () => {
    previewMock.mockReturnValue(partialMock<ReturnType<typeof useTemplatePreview>>({
      data: previewOf("Self review (template)", { renameTaken: true }), isLoading: false,
    }));
    renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: /Self review/ }));
    const add = screen.getByRole("button", { name: "Add" });
    expect(add).toBeEnabled();
    fireEvent.click(add);
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});

const renderWithRerender = () => {
  const onClose = jest.fn();
  const onAdded = jest.fn();
  const view = render(<AddReviewFormDialog open onCloseAction={onClose} onAddedAction={onAdded} />);
  return { onClose, onAdded, rerender: () => view.rerender(<AddReviewFormDialog open onCloseAction={onClose} onAddedAction={onAdded} />) };
};

describe("AddReviewFormDialog with a library form added before", () => {
  it("opens the company's copy instead of applying the template again", async () => {
    previewMock.mockReturnValue(partialMock<ReturnType<typeof useTemplatePreview>>({
      data: previewOf("Self review", { outcome: "EXISTING", existingName: "Self review" }), isLoading: false,
    }));
    const onAdded = jest.fn();
    render(<AddReviewFormDialog open onCloseAction={jest.fn()} onAddedAction={onAdded}
      existingForms={[{ id: "form-3", name: "Self review" }]} />);

    fireEvent.click(screen.getByRole("radio", { name: /Self review/ }));
    fireEvent.click(screen.getByRole("button", { name: "Open it" }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledWith({ id: "form-3" }));
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  // The preview keeps its last answer after a switch back to Blank (react-query's previous data); the dialog then
  // opened the old Self Review instead of creating the named blank form (walk of 2026-11-12).
  it("creates the blank form after a look at the library's, not the old copy", async () => {
    previewMock.mockReturnValue(partialMock<ReturnType<typeof useTemplatePreview>>({
      data: previewOf("Self review", { outcome: "EXISTING", existingName: "Self review" }), isLoading: false,
    }));
    saveMock.mockResolvedValue({ status: ActionStatus.SUCCESS, data: { ...created, id: "form-new", name: "Walk blank" } });
    const onAdded = jest.fn();
    render(<AddReviewFormDialog open onCloseAction={jest.fn()} onAddedAction={onAdded}
      existingForms={[{ id: "form-3", name: "Self review" }]} />);

    fireEvent.click(screen.getByRole("radio", { name: /Self review/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Blank form/ }));
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Walk blank" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(saveMock).toHaveBeenCalledWith({ id: null, body: { name: "Walk blank", description: null, questions: [] } }));
    expect(onAdded).toHaveBeenCalledWith(expect.objectContaining({ id: "form-new" }));
    expect(onAdded).not.toHaveBeenCalledWith({ id: "form-3" });
  });
});
