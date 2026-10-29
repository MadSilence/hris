import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TemplatePreview } from "./TemplatePreview";
import type { TemplateGrantDTO, TemplateItemDTO, TemplatePreviewDTO } from "@/api/modules/templates/dto";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useApplyTemplate,
  useTemplateApplication,
  useTemplatePreview,
} from "@/components/modules/settings/modules/templates/hooks";
import { partialMock } from "@/test/types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/components/modules/settings/modules/templates/hooks", () => ({
  useTemplatePreview: jest.fn(),
  useApplyTemplate: jest.fn(),
  useTemplateApplication: jest.fn(),
}));

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

const grant = (over: Partial<TemplateGrantDTO>): TemplateGrantDTO => ({
  key: "perm:PEOPLE.PROFILE:VIEW",
  permission: true,
  label: "People",
  action: "VIEW",
  scopes: ["COMPANY"],
  selected: true,
  defaultSelected: true,
  existingField: false,
  sensitive: false,
  valueCount: null,
  dropped: false,
  reason: null,
  ...over,
});

const role = (over: Partial<TemplateItemDTO> = {}): TemplateItemDTO => ({
  ref: "hr-admin",
  type: "ROLE",
  name: "HR Admin",
  finalName: "HR Admin",
  outcome: "NEW",
  include: true,
  clash: "SKIP",
  renameTaken: false,
  existingName: null,
  reason: null,
  fieldType: null,
  existingType: null,
  sensitive: false,
  valueCount: null,
  readers: [],
  grants: [
    grant({}),
    grant({
      key: "field:attr:salary:EDIT",
      permission: false,
      label: "Base salary",
      action: "EDIT",
      existingField: true,
      sensitive: true,
      valueCount: 42,
      selected: false,
      defaultSelected: false,
    }),
  ],
  tasks: [],
  ...over,
});

const preview = (item: TemplateItemDTO): TemplatePreviewDTO => ({
  key: "role.hr-admin",
  version: 1,
  kind: "ROLE",
  title: "HR Admin",
  summary: "Runs HR.",
  fingerprint: "fp-1",
  parts: [{
    key: "role.hr-admin",
    title: "HR Admin",
    kind: "ROLE",
    version: 1,
    root: true,
    included: true,
    appliedBefore: false,
    items: [item],
  }],
  counts: { create: item.outcome === "NEW" ? 1 : 0, existing: 0, skip: item.outcome === "CLASH" ? 1 : 0, dropped: 0 },
});

const refetch = jest.fn();
const mutateAsync = jest.fn();

const setUp = (item: TemplateItemDTO) => {
  (useTemplatePreview as jest.Mock).mockReturnValue({
    data: preview(item), error: null, isFetching: false, refetch,
  });
  (useApplyTemplate as jest.Mock).mockReturnValue(partialMock<ReturnType<typeof useApplyTemplate>>({
    mutateAsync, isPending: false,
  }));
  (useTemplateApplication as jest.Mock).mockReturnValue({ data: undefined, error: null, refetch: jest.fn() });
};

describe("TemplatePreview", () => {
  beforeEach(() => jest.clearAllMocks());

  /** Review item 7: an existing sensitive field is named as such, and its grant is not ticked for anybody. */
  it("marks a grant on an existing sensitive field and leaves it unticked", () => {
    setUp(role());
    render(<TemplatePreview templateKey="role.hr-admin"/>);

    fireEvent.click(screen.getByRole("button", { name: /1 of 2 grants/i }));

    expect(screen.getByText(/existing field · 42 values/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Base salary EDIT" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "People VIEW" })).toBeChecked();
  });

  it("applies with the preview's fingerprint", async () => {
    setUp(role());
    mutateAsync.mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "app-1" } });
    render(<TemplatePreview templateKey="role.hr-admin"/>);

    fireEvent.click(screen.getByRole("button", { name: /apply · 1 to create/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ fingerprint: "fp-1" })));
  });

  /** TPL00002 is not a failure to show in a card: the company moved, so the preview is asked again. */
  it("previews again when the company changed since the preview", async () => {
    setUp(role());
    mutateAsync.mockResolvedValue({ status: ActionStatus.ERROR, code: "TPL00002", errorMessage: "x" });
    render(<TemplatePreview templateKey="role.hr-admin"/>);

    fireEvent.click(screen.getByRole("button", { name: /apply · 1 to create/i }));

    expect(await screen.findByText(/the company changed since this preview/i)).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it("offers skip or a renamed copy on a clash, and applies nothing by default", () => {
    setUp(role({ outcome: "CLASH", reason: "The company already has a role called “HR Admin”.", existingName: "HR Admin" }));
    render(<TemplatePreview templateKey="role.hr-admin"/>);

    expect(screen.getByText("Name Taken")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /what to do with hr admin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nothing to create/i })).toBeDisabled();
  });
});
