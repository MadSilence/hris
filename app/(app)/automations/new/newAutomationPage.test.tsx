import * as React from "react";
import { render } from "@testing-library/react";

let search = new URLSearchParams("template=long-leave");
jest.mock("next/navigation", () => ({ useSearchParams: () => search }));
jest.mock("@/components/auth/PageGate", () => ({ PageGate: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
const opened: Array<string | null> = [];
jest.mock("@/components/modules/automations/editor", () => ({
  AutomationEditorContainer: ({ templateKey }: { templateKey: string | null }) => {
    opened.push(templateKey);
    return null;
  },
}));

import NewAutomationRoute from "./page";

describe("/automations/new", () => {
  it("keeps the template it opened with when the first save rewrites the address", () => {
    // Found in the walk of 2026-11-07: saving a template's first draft replaced the address with /automations/<id>,
    // the page read ?template= again, got nothing, and the editor came back empty.
    const { rerender } = render(<NewAutomationRoute />);
    search = new URLSearchParams("");
    rerender(<NewAutomationRoute />);
    expect(opened.length).toBeGreaterThan(1);
    expect(new Set(opened)).toEqual(new Set(["long-leave"]));
  });
});
