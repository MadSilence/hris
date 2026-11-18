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
    expect(screen.getByRole("button", { name: "Trash" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Documents" }));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });
});
