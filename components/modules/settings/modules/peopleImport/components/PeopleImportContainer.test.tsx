import { render, screen } from "@testing-library/react";

import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import { partialMock } from "@/test/types";
import { PeopleImportContainer } from "./PeopleImportContainer";

let current: { data: PeopleImportDTO | null; isLoading: boolean; error: unknown } = {
  data: null,
  isLoading: false,
  error: null,
};

const idle = () => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false });

jest.mock("@/components/modules/settings/modules/peopleImport/hooks", () => ({
  useCurrentPeopleImport: () => ({ ...current, refetch: jest.fn() }),
  usePeopleImportRows: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
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
  it("offers the template and the upload when there is no import", () => {
    show(null);
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
});
