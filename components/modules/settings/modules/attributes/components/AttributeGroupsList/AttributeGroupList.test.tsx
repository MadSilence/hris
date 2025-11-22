import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { configure } from "@testing-library/dom";
import "@testing-library/jest-dom";

configure({ testIdAttribute: "data-test" });

jest.mock("./AttributeGroupList.module.css", () => ({ root: "root", create: "create", list: "list" }), { virtual: true });

jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, onClick, style }: any) => (
    <button data-test="create-button" onClick={onClick} style={style}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/utils/ReorderableList", () => {
  const MockReorderableList = ({ items, getId, onReorder, className, RowComponent }: any) => (
    <div data-test="reorderable-list" data-class={className}>
      {items.map((item: any) => (
        <div key={getId(item)} data-test={`row-wrapper-${getId(item)}`}>
          <RowComponent
            item={item}
            sortable={{
              setNodeRef: jest.fn(),
              style: {},
              attributes: {},
              listeners: {},
              isDragging: false,
            }}
          />
        </div>
      ))}
      <button
        data-test="trigger-reorder"
        onClick={() => onReorder(items.map((i: any) => getId(i)))}
      >
        reorder
      </button>
    </div>
  );

  return { ReorderableList: MockReorderableList };
});

const mockRowRender = jest.fn();
jest.mock(
  "@/components/modules/settings/modules/attributes/components/AttributeGroupRow",
  () => ({
    AttributeGroupRow: ({ group, selectedId, onSelect }: any) => {
      mockRowRender({ group, selectedId });
      return (
        <div
          data-test={`attribute-group-row-${group.id}`}
          data-selected={group.id === selectedId ? "true" : "false"}
          onClick={() => onSelect(group.id)}
        >
          {group.name}
        </div>
      );
    },
  })
);

import { AttributeGroupList } from "./AttributeGroupList";
import type { AttributeGroup } from "@/models/attribute/AttributeGroup";

describe("AttributeGroupList", () => {
  const groups: AttributeGroup[] = [
    { id: "g1", name: "Group 1" } as any,
    { id: "g2", name: "Group 2" } as any,
  ];

  it("renders create button and calls onCreate", () => {
    const onCreate = jest.fn();
    render(
      <AttributeGroupList
        groups={groups}
        selectedId="g1"
        onSelect={jest.fn()}
        onCreate={onCreate}
        onOrderChange={jest.fn()}
      />
    );
    const btn = screen.getByTestId("create-button");
    expect(btn).toHaveTextContent("Create a section");
    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders a row for each group and marks selected correctly", () => {
    render(
      <AttributeGroupList
        groups={groups}
        selectedId="g2"
        onSelect={jest.fn()}
        onCreate={jest.fn()}
        onOrderChange={jest.fn()}
      />
    );

    const row1 = screen.getByTestId("attribute-group-row-g1");
    const row2 = screen.getByTestId("attribute-group-row-g2");

    expect(row1).toBeInTheDocument();
    expect(row2).toBeInTheDocument();

    expect(row1).toHaveAttribute("data-selected", "false");
    expect(row2).toHaveAttribute("data-selected", "true");

    expect(mockRowRender).toHaveBeenCalledWith({ group: groups[0], selectedId: "g2" });
    expect(mockRowRender).toHaveBeenCalledWith({ group: groups[1], selectedId: "g2" });
  });

  it("forwards onSelect to rows", () => {
    const onSelect = jest.fn();
    render(
      <AttributeGroupList
        groups={groups}
        selectedId="none"
        onSelect={onSelect}
        onCreate={jest.fn()}
        onOrderChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("attribute-group-row-g1"));
    expect(onSelect).toHaveBeenCalledWith("g1");

    fireEvent.click(screen.getByTestId("attribute-group-row-g2"));
    expect(onSelect).toHaveBeenCalledWith("g2");
  });

  it("calls onOrderChange when ReorderableList triggers reorder", () => {
    const onOrderChange = jest.fn();
    render(
      <AttributeGroupList
        groups={groups}
        selectedId="none"
        onSelect={jest.fn()}
        onCreate={jest.fn()}
        onOrderChange={onOrderChange}
      />
    );

    fireEvent.click(screen.getByTestId("trigger-reorder"));
    expect(onOrderChange).toHaveBeenCalledWith(["g1", "g2"]);
  });

  it("applies list class to the ReorderableList wrapper", () => {
    render(
      <AttributeGroupList
        groups={groups}
        selectedId="none"
        onSelect={jest.fn()}
        onCreate={jest.fn()}
        onOrderChange={jest.fn()}
      />
    );
    const list = screen.getByTestId("reorderable-list");
    expect(list).toHaveAttribute("data-class", "list");
    const wrapperG1 = screen.getByTestId("row-wrapper-g1");
    expect(within(wrapperG1).getByText("Group 1")).toBeInTheDocument();
  });
});
