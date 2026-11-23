import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyCalendarViewsRow } from "./CompanyCalendarViewsRow";

const view = { id: "v1", name: "Walk by office", payload: { filters: [] } };

describe("CompanyCalendarViewsRow", () => {
  it("keeps the rename popover open after Rename in the view's menu, and saves the new name", async () => {
    // The menu handed focus back to ⋯ as it closed, outside the popover, and the popover closed at once (walk of
    // 2026-11-23).
    const user = userEvent.setup();
    const onRename = jest.fn();
    render(
      <CompanyCalendarViewsRow
        builtIns={[{ id: "everyone", name: "Everyone" }]}
        views={[view]}
        activeId="everyone"
        onPick={jest.fn()}
        onSave={jest.fn()}
        onRename={onRename}
        onDelete={jest.fn()}
        onReorder={jest.fn()}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Actions for Walk by office" })[0]);
    await user.click(await screen.findByRole("menuitem", { name: "Rename" }));

    const field = await screen.findByRole("textbox", { name: "Name" });
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toHaveValue("Walk by office");

    await user.clear(field);
    await user.type(field, "Walk renamed{Enter}");
    expect(onRename).toHaveBeenCalledWith(view, "Walk renamed");
  });
});
