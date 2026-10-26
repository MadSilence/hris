import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TemplateTaskListView } from "./TemplateTaskListView";
import { deriveLanes, type DraftItem } from "./draft";

const item = (key: string, title: string, over: Partial<DraftItem> = {}): DraftItem => ({
  key,
  kind: "CHECKLIST",
  title,
  description: "",
  dueKind: "OFFSET",
  offsetDays: 0,
  assigneeKind: "TARGET",
  assigneeUserId: null,
  assigneeName: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: null,
  waitsFor: [],
  ...over,
});

describe("TemplateTaskListView", () => {
  const items = [
    item("late", "Ninety-day review", { offsetDays: 89, assigneeKind: "ONBOARDING_MANAGER" }),
    item("pass", "Passport", { dueKind: "BEFORE_START", offsetDays: null }),
    item("order", "Order a laptop", { offsetDays: -7, assigneeKind: "ONBOARDING_MANAGER" }),
    item("setup", "Set up the laptop", { offsetDays: 0, assigneeKind: "SPECIFIC_USER", assigneeUserId: "u1", assigneeName: "Linus", waitsFor: ["order"] }),
    item("month", "First month check-in", { offsetDays: 14 }),
  ];

  it("groups the tasks by phase, in timeline order, saying the day and who does it", () => {
    render(<TemplateTaskListView items={items} lanes={deriveLanes(items)} selectedKey={null} onSelectAction={jest.fn()} onAddAction={jest.fn()} />);

    const before = within(screen.getByRole("region", { name: "Before Start" }));
    expect(before.getAllByRole("button").map((b) => b.textContent)).toEqual([
      expect.stringContaining("Order a laptop"),
      expect.stringContaining("Passport"),
    ]);
    expect(before.getByText("7 days before start · Onboarding Manager")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Week 1" })).getByText("Day 1 · Linus")).toBeInTheDocument();
    expect(screen.getByText("Waits for Order a laptop")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Month 1" })).getByText("First month check-in")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Later" })).getByText("Ninety-day review")).toBeInTheDocument();
  });

  it("opens the same side panel as the canvas, and adds a task", () => {
    const onSelect = jest.fn();
    const onAdd = jest.fn();
    render(<TemplateTaskListView items={items} lanes={deriveLanes(items)} selectedKey="pass" onSelectAction={onSelect} onAddAction={onAdd} />);
    expect(screen.getByRole("button", { name: /Passport/ })).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: /Set up the laptop/ }));
    expect(onSelect).toHaveBeenCalledWith("setup");
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
    expect(onAdd).toHaveBeenCalled();
  });
});
