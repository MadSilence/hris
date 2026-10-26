import { fireEvent, render, screen, within } from "@testing-library/react";

import PeopleViewsPanel, { type PeopleViewsPanelProps } from "./PeopleViewsPanel";
import type { PeopleView } from "@/models/peopleView";

// The dialog has its own test and its own queries; the panel only opens it.
jest.mock("@/components/modules/organization/components/PeopleViews/ShareViewDialog", () => ({
  ShareViewDialog: () => null,
}));

const payload = { columns: ["sys:first_name"], filters: [], sort: null };

const mine: PeopleView = { id: "v-mine", name: "Engineering", payload, access: "OWNER" };
const editable: PeopleView = { id: "v-edit", name: "Hiring", payload, access: "EDIT", ownerName: "Olga Owner" };
const readOnly: PeopleView = { id: "v-read", name: "Pay Review", payload, access: "VIEW", ownerName: "Hugo Hr" };

const props = (over: Partial<PeopleViewsPanelProps> = {}): PeopleViewsPanelProps => ({
  collapsed: false,
  onToggleCollapsed: jest.fn(),
  views: [mine, editable, readOnly],
  isLoading: false,
  activeViewId: null,
  dirty: false,
  onApplyDefault: jest.fn(),
  onApplyView: jest.fn(),
  onSaveAs: jest.fn(),
  onUpdateActive: jest.fn(),
  onRename: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onCopyLink: jest.fn(),
  onSaveActiveCopy: jest.fn(),
  ...over,
});

describe("PeopleViewsPanel", () => {
  it("keeps my views and the ones shared with me apart, with whose each is and what I may do", () => {
    render(<PeopleViewsPanel {...props()} />);

    const own = screen.getByRole("region", { name: "My Views" });
    expect(within(own).getByText("Engineering")).toBeInTheDocument();
    expect(within(own).queryByText("Hiring")).not.toBeInTheDocument();

    const shared = screen.getByRole("region", { name: "Shared With Me" });
    expect(within(shared).getByText("Hiring")).toBeInTheDocument();
    expect(within(shared).getByText("Olga Owner · Can Edit")).toBeInTheDocument();
    expect(within(shared).getByText("Hugo Hr · Can View")).toBeInTheDocument();
  });

  it("has no Shared With Me section when nothing is shared", () => {
    render(<PeopleViewsPanel {...props({ views: [mine] })} />);

    expect(screen.queryByRole("region", { name: "Shared With Me" })).not.toBeInTheDocument();
  });

  it("opens a shared view like any other", () => {
    const onApplyView = jest.fn();
    render(<PeopleViewsPanel {...props({ onApplyView })} />);

    fireEvent.click(screen.getByText("Pay Review"));

    expect(onApplyView).toHaveBeenCalledWith(readOnly);
  });

  it("offers Save a Copy, not Save Changes, on a view shared to view only", () => {
    const onSaveActiveCopy = jest.fn();
    render(<PeopleViewsPanel {...props({ activeViewId: "v-read", dirty: true, onSaveActiveCopy })} />);

    expect(screen.queryByRole("button", { name: "Save Changes" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save a Copy" }));
    expect(onSaveActiveCopy).toHaveBeenCalled();
  });

  it("lets a can-edit grantee save their changes to the shared view", () => {
    const onUpdateActive = jest.fn();
    render(<PeopleViewsPanel {...props({ activeViewId: "v-edit", dirty: true, onUpdateActive })} />);

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(onUpdateActive).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Save a Copy" })).not.toBeInTheDocument();
  });

  it("copies the page's own address instead of minting a share link", () => {
    const onCopyLink = jest.fn();
    render(<PeopleViewsPanel {...props({ onCopyLink })} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy Link" }));
    expect(onCopyLink).toHaveBeenCalled();
    expect(screen.queryByText(/share link/i)).not.toBeInTheDocument();
  });
});
