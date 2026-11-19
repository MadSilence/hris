import { isOverdueTask } from "./MyTasksWidget";

describe("isOverdueTask (My tasks K5)", () => {
  it("is not overdue on its due day, though the due date has been reached", () => {
    expect(isOverdueTask({ dueReached: true, dueDate: "2026-11-19" }, "2026-11-19")).toBe(false);
  });

  it("is overdue once the due day has passed with the task open", () => {
    expect(isOverdueTask({ dueReached: true, dueDate: "2026-11-16" }, "2026-11-19")).toBe(true);
  });

  it("is not overdue before its due date is reached", () => {
    expect(isOverdueTask({ dueReached: false, dueDate: "2026-11-21" }, "2026-11-19")).toBe(false);
  });
});
