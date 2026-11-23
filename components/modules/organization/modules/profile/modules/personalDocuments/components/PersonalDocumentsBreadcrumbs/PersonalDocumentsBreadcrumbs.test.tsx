import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalDocumentsBreadcrumbs } from "./PersonalDocumentsBreadcrumbs";

describe("PersonalDocumentsBreadcrumbs", () => {
  it("names the trash by its own name — it has no id, like the root (walk of 2026-11-18)", () => {
    const onNavigate = jest.fn();
    render(
      <PersonalDocumentsBreadcrumbs
        items={[{ id: null, name: "ignored" }, { id: null, name: "Trash" }]}
        onNavigate={onNavigate}
      />,
    );
    // The last hop is where one stands: its name, not a button (T01, DT29).
    expect(screen.getByText("Trash")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trash" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Documents" }));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });
});
