import { fireEvent, render, screen } from "@testing-library/react";

import type { PeopleImportDTO, PeopleImportKind, PeopleImportRowDTO } from "@/api/modules/peopleImport/dto";
import { partialMock } from "@/test/types";
import { ForbiddenError } from "@/components/clients/exceptions";
import { PeopleImportContainer } from "./PeopleImportContainer";

let current: { data: PeopleImportDTO | null; isLoading: boolean; error: unknown } = {
  data: null,
  isLoading: false,
  error: null,
};

const idle = () => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false });

let rows: PeopleImportRowDTO[] = [];
let kinds: PeopleImportKind[] = ["ORG_STRUCTURE", "PEOPLE_CREATE", "LEAVE_BALANCES"];
const edit = idle();

jest.mock("@/components/modules/settings/modules/peopleImport/hooks", () => ({
  useCurrentPeopleImport: () => ({ ...current, refetch: jest.fn() }),
  usePeopleImportRows: () => ({ data: rows, isLoading: false, error: null, refetch: jest.fn() }),
  useImportKinds: () => ({ data: kinds, isLoading: false, error: null, refetch: jest.fn() }),
  useEditPeopleImportRows: () => edit,
  PeopleImportActionError: class extends Error {},
  useUploadPeopleImport: () => idle(),
  useUpdatePeopleImport: () => idle(),
  useCheckPeopleImport: () => idle(),
  useApplyPeopleImport: () => idle(),
  useInvitePeopleImport: () => idle(),
  useDiscardPeopleImport: () => idle(),
}));

jest.mock("@/components/modules/settings/shared/ExportDataModal/triggerExportDownload", () => ({
  triggerExportDownload: jest.fn(),
}));

const anImport = (overrides: Partial<PeopleImportDTO>): PeopleImportDTO =>
  partialMock<PeopleImportDTO>({
    id: "imp-1",
    kind: "PEOPLE_CREATE",
    version: 3,
    summary: {},
    unchangedCount: 0,
    lastEditedByName: null,
    lastEditedAt: null,
    fileName: "people.csv",
    fileFormat: "CSV",
    status: "UPLOADED",
    headers: ["First name", "Last name", "Email"],
    mapping: { "0": "sys:first_name", "1": "sys:last_name", "2": "sys:email" },
    dateFormat: "ISO",
    decimalSeparator: "DOT",
    inviteAfter: false,
    rowCount: 12,
    errorRowCount: 0,
    startLaterCount: 0,
    withoutEmailCount: 0,
    createdCount: 0,
    failedCount: 0,
    invitedCount: 0,
    processedCount: 0,
    fileErrors: [],
    errorDetail: null,
    fields: [
      { id: "sys:first_name", header: "First name", required: true },
      { id: "sys:last_name", header: "Last name", required: true },
      { id: "sys:email", header: "Email", required: false },
    ],
    dateFormats: [{ value: "ISO", example: "2026-03-04" }],
    canInvite: true,
    checkedAt: null,
    finishedAt: null,
    ...overrides,
  });

const show = (data: PeopleImportDTO | null) => {
  current = { data, isLoading: false, error: null };
  return render(<PeopleImportContainer />);
};

describe("PeopleImportContainer", () => {
  it("tells somebody with no import right that the page is not theirs, with nothing to retry", () => {
    current = { data: null, isLoading: false, error: new ForbiddenError("forbidden", { status: 403, code: "IMP00114" }) };
    render(<PeopleImportContainer />);
    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
    current = { data: null, isLoading: false, error: null };
  });

  it("asks what is being imported, in move-in order, before offering a template", () => {
    show(null);
    expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual([
      expect.stringContaining("Structure"), expect.stringContaining("People"), expect.stringContaining("Leave Balances"),
    ]);
    expect(screen.queryByRole("button", { name: /download xlsx template/i })).not.toBeInTheDocument();
  });

  it("offers only the kinds the caller may run, and needs no choice when there is one", () => {
    kinds = ["PEOPLE_CREATE"];
    show(null);
    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /download xlsx template/i })).toBeInTheDocument();
    kinds = ["ORG_STRUCTURE", "PEOPLE_CREATE", "LEAVE_BALANCES"];
  });

  it("offers the template and the upload once a kind is chosen", () => {
    show(null);
    fireEvent.click(screen.getByRole("radio", { name: /^People/ }));
    expect(screen.getByRole("button", { name: /download xlsx template/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
  });

  it("maps the columns of an uploaded file, each to a field", () => {
    show(anImport({ status: "UPLOADED" }));
    expect(screen.getByText("people.csv")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Field for Email" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check File" })).toBeEnabled();
  });

  it("does not let a file be checked until both names are mapped", () => {
    show(anImport({ status: "MAPPED", mapping: { "0": "sys:first_name" } }));
    expect(screen.getByText(/still to match: last name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check File" })).toBeDisabled();
  });

  it("says what will happen before anything is created", () => {
    show(anImport({ status: "CHECKED", startLaterCount: 2, withoutEmailCount: 1 }));
    expect(screen.getByRole("button", { name: "Import 12 people" })).toBeInTheDocument();
    expect(screen.getByText(/2 people have a hire date after today/i)).toBeInTheDocument();
    expect(screen.getByText(/1 person has no email/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /invite everybody with an email/i })).toBeInTheDocument();
  });

  it("offers the invitations only to somebody who may send them", () => {
    show(anImport({ status: "CHECKED", canInvite: false }));
    expect(screen.queryByRole("checkbox", { name: /invite everybody/i })).not.toBeInTheDocument();
  });

  it("shows the progress while the import is being applied", () => {
    show(anImport({ status: "APPLYING", processedCount: 6 }));
    expect(screen.getByText(/6 of 12 rows/)).toBeInTheDocument();
  });

  it("reports what was created and offers the invitations a failed row held back", () => {
    show(anImport({ status: "COMPLETED_WITH_FAILURES", createdCount: 11, failedCount: 1, inviteAfter: true }));
    expect(screen.getByText(/11 people imported from people.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/no invitations were sent, because a row failed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /invite the 11 people created/i })).toBeInTheDocument();
  });

  it("says how many units a structure file will create", () => {
    show(anImport({ kind: "ORG_STRUCTURE", status: "CHECKED", rowCount: 5, summary: { departments: 3, teams: 2 } }));
    expect(screen.getByText("3 departments")).toBeInTheDocument();
    expect(screen.getByText("2 teams")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import 5 units" })).toBeInTheDocument();
  });

  it("lets the preview clear every unknown lead in one request carrying the import's version", () => {
    rows = [partialMock<PeopleImportRowDTO>({
      rowNumber: 3, name: "Engineering", status: "PENDING", cells: ["Department", "Engineering", null, "ghost@x.test"],
      preview: null,
      errors: [{ column: 3, columnHeader: "Lead", code: "IMP00229", params: ["ghost@x.test"] }],
    })];
    show(anImport({
      kind: "ORG_STRUCTURE", status: "MAPPED", checkedAt: "2026-10-29T10:00:00Z", errorRowCount: 1,
      headers: ["Type", "Name", "Parent", "Lead"],
      mapping: { "0": "org:type", "1": "org:name", "2": "org:parent", "3": "org:lead" },
      fields: [{ id: "org:type", header: "Type", required: true }, { id: "org:name", header: "Name", required: true }],
      lastEditedByName: "Ada Lovelace", lastEditedAt: "2026-10-29T10:00:00Z",
    }));
    expect(screen.getByText(/last edited by ada lovelace/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear Unknown Leads" }));
    expect(edit.mutate).toHaveBeenCalledWith(
      { id: "imp-1", body: { version: 3, edits: [{ rowNumber: 3, column: 3, value: null }], removeRows: [] } },
      expect.anything(),
    );
    rows = [];
  });
});
