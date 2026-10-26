import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { RestoreWithChildrenModal } from "./RestoreWithChildrenModal";
import type { RestoreChild } from "./restoreSelection";

/**
 * Sales (restored) ├ Inbound (cascade) │ └ EMEA (cascade) └ Outbound (archived separately)
 */
const tree: RestoreChild[] = [
  { id: "inbound", name: "Inbound", parentId: "sales", depth: 1, archivedAt: "2026-10-01T10:00:00", archivedWithParent: true },
  { id: "emea", name: "EMEA", parentId: "inbound", depth: 2, archivedAt: "2026-10-01T10:00:00", archivedWithParent: true },
  { id: "outbound", name: "Outbound", parentId: "sales", depth: 1, archivedAt: "2026-03-12T09:30:00", archivedWithParent: false },
];

const renderModal = (items: RestoreChild[] = tree, overrides: Partial<React.ComponentProps<typeof RestoreWithChildrenModal>> = {}) => {
  const onConfirmAction = jest.fn();
  const onCancelAction = jest.fn();
  render(
    <RestoreWithChildrenModal
      isOpen
      title="Unarchive Department"
      name="Sales"
      childNoun="sub-departments"
      items={items}
      onConfirmAction={onConfirmAction}
      onCancelAction={onCancelAction}
      {...overrides}
    />,
  );
  return { onConfirmAction, onCancelAction };
};

const box = (name: string) => screen.getByRole("checkbox", { name: new RegExp(`^${name}`) });
const isChecked = (name: string) => box(name).getAttribute("aria-checked") === "true";

describe("RestoreWithChildrenModal", () => {
  it("pre-checks what the cascade archived and leaves what was archived separately unchecked, saying when", () => {
    renderModal();

    expect(isChecked("Inbound")).toBe(true);
    expect(isChecked("EMEA")).toBe(true);
    expect(isChecked("Outbound")).toBe(false);
    expect(screen.getByText(/^Archived separately on /)).toBeInTheDocument();
    expect(screen.getAllByText(/Archived separately/)).toHaveLength(1);
  });

  it("says plainly that people are not put back", () => {
    renderModal();

    expect(screen.getByText(/People the archive removed are not put back/)).toBeInTheDocument();
  });

  it("checking a child checks its archived parent", () => {
    renderModal();

    fireEvent.click(box("Inbound"));
    expect(isChecked("Inbound")).toBe(false);
    expect(isChecked("EMEA")).toBe(false);

    fireEvent.click(box("EMEA"));
    expect(isChecked("EMEA")).toBe(true);
    expect(isChecked("Inbound")).toBe(true);
  });

  it("unchecking a parent unchecks everything below it", () => {
    renderModal();

    fireEvent.click(box("Inbound"));

    expect(isChecked("Inbound")).toBe(false);
    expect(isChecked("EMEA")).toBe(false);
    expect(isChecked("Outbound")).toBe(false);
  });

  it("does not pre-check a cascade child whose parent was archived separately", () => {
    renderModal([
      { id: "outbound", name: "Outbound", parentId: "sales", depth: 1, archivedAt: null, archivedWithParent: false },
      { id: "apac", name: "APAC", parentId: "outbound", depth: 2, archivedAt: null, archivedWithParent: true },
    ]);

    expect(isChecked("Outbound")).toBe(false);
    expect(isChecked("APAC")).toBe(false);
  });

  it("submits the chosen ids in list order", () => {
    const { onConfirmAction } = renderModal();

    fireEvent.click(box("Outbound"));
    fireEvent.click(screen.getByRole("button", { name: "Unarchive" }));

    expect(onConfirmAction).toHaveBeenCalledWith(["inbound", "emea", "outbound"]);
  });

  it("submits on Enter and shows a refusal inside the dialog", () => {
    const { onConfirmAction } = renderModal(tree, { errorMessage: "A sub-department can only come back with its parent." });

    fireEvent.keyDown(box("Inbound"), { key: "Enter" });

    expect(onConfirmAction).toHaveBeenCalledWith(["inbound", "emea"]);
    expect(screen.getByRole("alert")).toHaveTextContent("A sub-department can only come back with its parent.");
  });

  it("lists a flat set of positions with their codes", () => {
    const { onConfirmAction } = renderModal(
      [
        { id: "j1", name: "Engineer", detail: "ENG-1", parentId: null, depth: 1, archivedAt: "2026-10-01T10:00:00", archivedWithParent: true },
        { id: "j2", name: "Designer", detail: null, parentId: null, depth: 1, archivedAt: "2026-02-01T10:00:00", archivedWithParent: false },
      ],
      { title: "Unarchive Job Family", childNoun: "positions" },
    );

    expect(screen.getByText("ENG-1")).toBeInTheDocument();
    fireEvent.click(box("Designer"));
    expect(isChecked("Engineer")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Unarchive" }));

    expect(onConfirmAction).toHaveBeenCalledWith(["j1", "j2"]);
  });

  it("Cancel closes without restoring", () => {
    const { onConfirmAction, onCancelAction } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancelAction).toHaveBeenCalled();
    expect(onConfirmAction).not.toHaveBeenCalled();
  });
});
