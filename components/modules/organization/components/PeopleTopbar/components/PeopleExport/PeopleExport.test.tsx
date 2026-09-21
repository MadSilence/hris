import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildPeopleExportRequest, PeopleExport, PeopleExportProps } from "./PeopleExport";
import { ForbiddenError, ServerError } from "@/components/clients/exceptions";

// Permission gating is UX only and has its own tests; here it would hide the control.
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockDownload = jest.fn();
jest.mock("@/components/modules/settings/shared/ExportDataModal/triggerExportDownload", () => ({
  triggerExportPostDownload: (...args: unknown[]) => mockDownload(...args),
}));

const props = (overrides: Partial<PeopleExportProps> = {}): PeopleExportProps => ({
  columns: [
    { id: "sys:first_name", label: "Name", checked: true },
    { id: "sys:email", label: "Email", checked: true },
    { id: "attr:shirt", label: "Shirt size", checked: false },
    { id: "sys:department", label: "Department", checked: true },
  ],
  filters: [{ field: "sys:department", op: "in", values: ["d1"] }],
  query: "  an ",
  showingDrafts: false,
  sort: { fieldId: "email", dir: "desc" },
  ...overrides,
});

const openAndExport = async (toggleAll = false) => {
  const user = userEvent.setup();
  render(<PeopleExport {...props()} />);
  await user.click(screen.getByLabelText("Export people"));
  if (toggleAll) await user.click(screen.getByRole("switch", { name: "Export all columns" }));
  await user.click(screen.getByRole("button", { name: "Export" }));
};

describe("buildPeopleExportRequest", () => {
  it("sends the view: shown columns in order, filters, search term, sort and segment", () => {
    expect(buildPeopleExportRequest(props({ showingDrafts: true }), false, "csv")).toEqual({
      q: "an",
      sortField: "email",
      sortDir: "desc",
      filters: [{ field: "sys:department", op: "in", values: ["d1"] }],
      drafts: "ONLY",
      columns: ["sys:first_name", "sys:email", "sys:department"],
      allColumns: false,
      format: "csv",
    });
  });

  it("with all columns sends every offered column in the table's order", () => {
    const request = buildPeopleExportRequest(props(), true, "xlsx");
    expect(request.columns).toEqual(["sys:first_name", "sys:email", "attr:shirt", "sys:department"]);
    expect(request.allColumns).toBe(true);
  });

  it("falls back to the table's default order and drops a one-letter search", () => {
    const request = buildPeopleExportRequest(props({ sort: undefined, query: "a", filters: [] }), false, "xlsx");
    expect(request).toMatchObject({ q: null, sortField: "first_name", sortDir: "asc", filters: null, drafts: null });
  });
});

describe("PeopleExport", () => {
  it("posts the current view through the shared download helper and closes", async () => {
    mockDownload.mockResolvedValue(undefined);

    await openAndExport();

    await waitFor(() => expect(mockDownload).toHaveBeenCalledTimes(1));
    const [path, format, body] = mockDownload.mock.calls[0];
    expect(path).toBe("/api/users/export");
    expect(format).toBe("xlsx");
    expect(body).toMatchObject({ allColumns: false, columns: ["sys:first_name", "sys:email", "sys:department"] });
    await waitFor(() => expect(screen.queryByText("Export people")).not.toBeInTheDocument());
  });

  it("asks for all columns when the switch is on", async () => {
    mockDownload.mockResolvedValue(undefined);

    await openAndExport(true);

    await waitFor(() => expect(mockDownload).toHaveBeenCalledTimes(1));
    expect(mockDownload.mock.calls[0][2]).toMatchObject({ allColumns: true });
  });

  it("keeps the dialog open and says why when the export fails", async () => {
    mockDownload.mockRejectedValue(new ServerError("boom", { status: 500 }));

    await openAndExport();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Export people")).toBeInTheDocument();
  });

  it("closes without a second message when the refusal was already announced", async () => {
    mockDownload.mockRejectedValue(new ForbiddenError("Access denied", { status: 403, code: "E00403" }));

    await openAndExport();

    await waitFor(() => expect(screen.queryByText("Export people")).not.toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
