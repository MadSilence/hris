import { render, screen } from "@testing-library/react";

import { ProfileTabsNav } from "./ProfileTabsNav";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/organization/people/u1/personal",
  useRouter: () => ({ push }),
}));

let viewerId = "someone-else";
jest.mock("@/components/providers/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ user: { id: viewerId } }),
}));

/**
 * The tabs read one thing: what the server says this caller may do **to this person**. The client
 * deriving it from its own scope names is what this replaced, and a missing map is what once hid
 * Documents and Time Off from everybody — so both the presence and the absence of a capability are
 * pinned here.
 */
describe("ProfileTabsNav", () => {
  // Radix puts `role="tab"` on the anchor it renders through `asChild`, so the trigger is a tab
  // rather than a link as far as the accessibility tree is concerned.
  beforeEach(() => { viewerId = "someone-else"; });

  // Public Profile, Salary, Forms, Tasks and Notes are UI only and carry no resource yet.
  const UNGATED = ["Public Profile", "Personal Info", "Salary", "Forms", "Tasks", "Notes"];

  const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent);

  it("shows a gated tab when the caller holds VIEW on this person", () => {
    render(
      <ProfileTabsNav
        userId="u1"
        capabilities={{
          "PEOPLE.DOCUMENTS": ["VIEW"],
          "PEOPLE.TIME_OFF": ["VIEW", "EDIT"],
        }}
      />
    );

    expect(tabNames()).toEqual([
      "Public Profile", "Personal Info", "Documents", "Time Off", "Salary", "Forms", "Tasks", "Notes",
    ]);
    expect(screen.getByRole("tab", { name: "Time Off" })).toHaveAttribute(
      "href",
      "/organization/people/u1/time-off"
    );
  });

  it("hides a tab the caller may not view on this person", () => {
    render(
      <ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.DOCUMENTS": ["VIEW"] }}/>
    );

    expect(tabNames()).toEqual([
      "Public Profile", "Personal Info", "Documents", "Salary", "Forms", "Tasks", "Notes",
    ]);
  });

  it("hides a tab granted an action other than VIEW", () => {
    // EDIT without VIEW is not a reading right — the tab would open onto a refusal.
    render(<ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.TIME_OFF": ["EDIT"] }}/>);

    expect(tabNames()).toEqual(UNGATED);
  });

  it("keeps the ungated tabs when no capability map arrived at all", () => {
    // The ungated tabs are the floor: whatever went wrong upstream, the profile still opens.
    render(<ProfileTabsNav userId="u1"/>);

    expect(tabNames()).toEqual(UNGATED);
  });

  // Q6: Reviews shows to the person, their line manager and REVIEWS.RESULT holders — nobody else.
  it("shows Reviews to the person themself", () => {
    viewerId = "u1";
    render(<ProfileTabsNav userId="u1"/>);
    expect(tabNames()).toContain("Reviews");
  });

  it("shows Reviews to the person's line manager", () => {
    viewerId = "boss";
    render(<ProfileTabsNav userId="u1" managerId="boss"/>);
    expect(tabNames()).toContain("Reviews");
  });

  it("shows Reviews to a holder of the result right on this person, and hides it from anybody else", () => {
    const { unmount } = render(<ProfileTabsNav userId="u1" managerId="boss" capabilities={{ "REVIEWS.RESULT": ["VIEW"] }}/>);
    expect(tabNames()).toContain("Reviews");
    unmount();
    render(<ProfileTabsNav userId="u1" managerId="boss"/>);
    expect(tabNames()).not.toContain("Reviews");
  });
});
