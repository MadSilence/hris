import { fireEvent, render, screen } from "@testing-library/react";
import { RowAction, RowActionsMenu } from "./RowActionsMenu";

// The dropdown renders its content inline here; what matters is the React tree, which a portal keeps.
jest.mock("@/components/desact/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children, onClick }: { children: React.ReactNode; onClick?: React.MouseEventHandler }) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));

describe("RowActionsMenu in a clickable row", () => {
  it("does not open the row when an item is chosen", () => {
    const openRow = jest.fn();
    const archive = jest.fn();
    render(
      <div onClick={openRow}>
        <RowActionsMenu label="Office actions" stopPropagation>
          <RowAction icon={null} onClick={archive}>Archive</RowAction>
        </RowActionsMenu>
      </div>,
    );

    fireEvent.click(screen.getByText("Archive"));

    expect(archive).toHaveBeenCalled();
    expect(openRow).not.toHaveBeenCalled();
  });

  it("does not open the row when the kebab itself is clicked", () => {
    const openRow = jest.fn();
    render(
      <div onClick={openRow}>
        <RowActionsMenu label="Office actions" stopPropagation>
          <RowAction icon={null} onClick={jest.fn()}>Archive</RowAction>
        </RowActionsMenu>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Office actions" }));

    expect(openRow).not.toHaveBeenCalled();
  });
});
