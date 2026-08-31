import { render, screen } from "@testing-library/react";

import { ProfileTabsNav } from "./ProfileTabsNav";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/organization/people/u1/personal",
  useRouter: () => ({ push }),
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

    expect(tabNames()).toEqual(["Personal Info", "Documents", "Time Off"]);
    expect(screen.getByRole("tab", { name: "Time Off" })).toHaveAttribute(
      "href",
      "/organization/people/u1/time-off"
    );
  });

  it("hides a tab the caller may not view on this person", () => {
    render(
      <ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.DOCUMENTS": ["VIEW"] }}/>
    );

    expect(tabNames()).toEqual(["Personal Info", "Documents"]);
  });

  it("hides a tab granted an action other than VIEW", () => {
    // EDIT without VIEW is not a reading right — the tab would open onto a refusal.
    render(<ProfileTabsNav userId="u1" capabilities={{ "PEOPLE.TIME_OFF": ["EDIT"] }}/>);

    expect(tabNames()).toEqual(["Personal Info"]);
  });

  it("keeps Personal Info when no capability map arrived at all", () => {
    // The ungated tab is the floor: whatever went wrong upstream, the profile still opens.
    render(<ProfileTabsNav userId="u1"/>);

    expect(tabNames()).toEqual(["Personal Info"]);
  });
});
