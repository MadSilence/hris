import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ProcessDetailContainer } from "./ProcessDetailContainer";
import { useLifecycleProcess } from "@/components/modules/lifecycle/hooks";
import type { Process } from "@/models/lifecycle";

jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/modules/lifecycle/actions/lifecycleActions");
jest.mock("@/components/modules/lifecycle/hooks", () => ({
  useLifecycleProcess: jest.fn(),
  useInvalidateLifecycle: () => jest.fn(),
  useProcessDeleteImpact: () => ({ data: undefined, isLoading: false, isError: false }),
}));
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: () => null,
}));

const process = (over: Partial<Process> = {}): Process => ({
  id: "proc1",
  type: "ONBOARDING",
  status: "COMPLETED",
  target: { id: "p1", name: "Alan Turing" },
  manager: { id: "m1", name: "Ada Lovelace" },
  templateName: "Standard",
  templateVersion: 1,
  anchorDate: "2026-10-14",
  anchorDrift: null,
  tasks: [],
  closedAt: "2026-10-20T10:00:00Z",
  archivedAt: null,
  createdAt: "2026-10-01T10:00:00Z",
  linkActive: false,
  ...over,
});

describe("ProcessDetailContainer", () => {
  it("marks an archived process with the Archived chip", () => {
    (useLifecycleProcess as jest.Mock).mockReturnValue({ data: process({ archivedAt: "2026-10-21T10:00:00Z" }), isLoading: false, error: null });
    render(<ProcessDetailContainer processId="proc1" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows no Archived chip on a process that is not archived", () => {
    (useLifecycleProcess as jest.Mock).mockReturnValue({ data: process(), isLoading: false, error: null });
    render(<ProcessDetailContainer processId="proc1" />);
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });
});
