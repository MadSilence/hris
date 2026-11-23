import { render, screen } from "@testing-library/react";

import { ProfileTabsNav } from "./ProfileTabsNav";

const push = jest.fn();
const replace = jest.fn();
let pathname = "/organization/people/u1/personal";

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push, replace }),
}));

let viewerId = "someone-else";
jest.mock("@/components/providers/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ user: { id: viewerId } }),
}));

/**
 * The tabs read one thing: what the server says this caller may do **to this person**. The client
 * deriving it from its own scope names is what this replaced, and a missing map is what once hid
 * Documents and Time off from everybody — so both the presence and the absence of a capability are
 * pinned here.
 */
describe("ProfileTabsNav", () => {
  // Radix puts `role="tab"` on the anchor it renders through `asChild`, so the trigger is a tab
  // rather than a link as far as the accessibility tree is concerned.
  beforeEach(() => {
    viewerId = "someone-else";
    pathname = "/organization/people/u1/personal";
    replace.mockReset();
  });

  // Public profile, Salary, Forms, Tasks and Notes are UI only and carry no resource yet.
  const UNGATED = ["Public profile", "Personal info", "Salary", "Forms", "Tasks", "Notes"];

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
      "Public profile", "Personal info", "Documents", "Time off", "Salary", "Forms", "Tasks", "Notes",
    ]);
    expect(screen.getByRole("tab", { name: "Time off" })).toHaveAttribute(
      "href",
      "/organization/people/u1/time-off"
    );
  });

  it("hides a tab the caller may not view on this person", () => {
    render(
      <ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.DOCUMENTS": ["VIEW"] }}/>
    );

    expect(tabNames()).toEqual([
      "Public profile", "Personal info", "Documents", "Salary", "Forms", "Tasks", "Notes",
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

  // W11: a hidden tab opened by its address sends the reader to the first tab they may see.
  it("sends a reader who typed a hidden tab's address to their first visible tab", () => {
    pathname = "/organization/people/u1/attendance";
    render(<ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.DOCUMENTS": ["VIEW"] }}/>);

    expect(replace).toHaveBeenCalledWith("/organization/people/u1/public-profile");
  });

  it("leaves a reader on a tab they may see where they are", () => {
    pathname = "/organization/people/u1/time-off";
    render(<ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.TIME_OFF": ["VIEW"] }}/>);

    expect(replace).not.toHaveBeenCalled();
  });

  it("does not move anybody before the capability map has arrived", () => {
    pathname = "/organization/people/u1/time-off";
    render(<ProfileTabsNav userId="u1"/>);

    expect(replace).not.toHaveBeenCalled();
  });

  it("sends nobody away from Reviews who may read it as the person", () => {
    viewerId = "u1";
    pathname = "/organization/people/u1/reviews";
    render(<ProfileTabsNav userId="u1" capabilities={{}}/>);

    expect(replace).not.toHaveBeenCalled();
  });
});
