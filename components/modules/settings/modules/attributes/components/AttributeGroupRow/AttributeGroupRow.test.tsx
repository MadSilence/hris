import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
jest.mock("./AttributeGroupRow.module.css", () => ({ item: "item", active: "active", handle: "handle" }), { virtual: true });

import { AttributeGroupRow } from "./AttributeGroupRow";
import type { AttributeGroup } from "@/models/attribute/AttributeGroup";
import type { SortableApi } from "@/components/utils/SortableRow";

const getRow = (): HTMLElement => {
  return (
    screen.queryByTestId?.("attribute-group-row") ??
    (document.querySelector('[data-testid="attribute-group-row"]') as HTMLElement) ??
    (document.querySelector('[data-test="attribute-group-row"]') as HTMLElement)
  );
};

describe("AttributeGroupRow", () => {
  const baseGroup: AttributeGroup = { id: "g1", name: "Group 1" } as AttributeGroup;

  const makeSortable = (): SortableApi => ({
    setNodeRef: jest.fn(),
    style: { opacity: 0.9 },
    attributes: { "data-sortable": "true" } as any,
    listeners: { onPointerDown: jest.fn() } as any,
    isDragging: false,
  });

  it("renders group name", () => {
    const sortable = makeSortable();
    render(
      <AttributeGroupRow
        group={baseGroup}
        sortable={sortable}
        selectedId="other"
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("Group 1")).toBeInTheDocument();
  });

  it("adds active class when selected", () => {
    const sortable = makeSortable();
    render(
      <AttributeGroupRow
        group={baseGroup}
        sortable={sortable}
        selectedId="g1"
        onSelect={jest.fn()}
      />
    );
    const row = getRow();
    expect(row).toHaveClass("item");
    expect(row).toHaveClass("active");
  });

  it("does not add active class when not selected", () => {
    const sortable = makeSortable();
    render(
      <AttributeGroupRow
        group={baseGroup}
        sortable={sortable}
        selectedId="g2"
        onSelect={jest.fn()}
      />
    );
    const row = getRow();
    expect(row).toHaveClass("item");
    expect(row).not.toHaveClass("active");
  });

  it("calls onSelect with group id on click", () => {
    const sortable = makeSortable();
    const onSelect = jest.fn();
    render(
      <AttributeGroupRow
        group={baseGroup}
        sortable={sortable}
        selectedId="other"
        onSelect={onSelect}
      />
    );
    fireEvent.click(getRow());
    expect(onSelect).toHaveBeenCalledWith("g1");
  });

  it("forwards sortable refs, style, attributes and listeners", () => {
    const sortable = makeSortable();
    render(
      <AttributeGroupRow
        group={baseGroup}
        sortable={sortable}
        selectedId="other"
        onSelect={jest.fn()}
      />
    );

    expect(sortable.setNodeRef).toHaveBeenCalled();

    const row = getRow() as HTMLDivElement;
    expect(row.style.opacity).toBe("0.9");

    const handle = row.querySelector(".handle") as HTMLElement;
    expect(handle).toHaveAttribute("data-sortable", "true");

    fireEvent.pointerDown(handle);
    expect((sortable.listeners as any).onPointerDown).toHaveBeenCalled();
  });
});
