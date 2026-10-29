import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { PreboardingPageContainer } from "./PreboardingPageContainer";
import type { PreboardingPage } from "@/models/lifecycle";

jest.mock("@/components/modules/lifecycle/actions/preboardingActions");

type PageTask = PreboardingPage["tasks"][number];

const task = (id: string, over: Partial<PageTask> = {}): PageTask => ({
  id,
  kind: "CHECKLIST",
  title: `Task ${id}`,
  description: null,
  status: "OPEN",
  dueKind: "OFFSET",
  dueDate: null,
  fields: null,
  categoryName: null,
  ...over,
});

const page: PreboardingPage = {
  firstName: "Alan",
  companyName: "Acme",
  startDate: "2026-11-02",
  tasks: [task("a", { title: "Sign the contract", status: "DONE" }), task("b", { title: "Say hello" })],
};

describe("PreboardingPageContainer", () => {
  it("marks a done task as done and leaves an open one to do", () => {
    render(<PreboardingPageContainer token="tok" initialPage={page} />);
    const [done, open] = screen.getAllByRole("listitem");

    expect(within(done).getByText("Done")).toBeInTheDocument();
    expect(within(done).queryByRole("button", { name: "Mark Done" })).not.toBeInTheDocument();

    expect(within(open).queryByText("Done")).not.toBeInTheDocument();
    expect(within(open).getByRole("button", { name: "Mark Done" })).toBeInTheDocument();
  });
});
