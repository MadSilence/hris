import { render, screen } from "@testing-library/react";
import { dateToISO } from "@/lib/date";
import { CelebrationStrip } from "./CelebrationStrip";

const today = dateToISO(new Date());
let items: unknown[] = [];
jest.mock("@/components/modules/home/hooks", () => ({
  useCelebrations: () => ({ isLoading: false, isError: false, data: { items } }),
}));

const flags = { enabled: true, birthdays: true, anniversaries: true, joiners: true };

// B4 (the owner, 2026-11-14): a tile reads "Today · {team}", as drawn; "Today" alone when there is no team to name.
describe("CelebrationStrip", () => {
  it("names the person's team under a birthday", () => {
    items = [{ kind: "BIRTHDAY", userId: "u1", firstName: "Ana", lastName: "Ruiz", avatarUrl: null, date: today, teamName: "Design" }];
    render(<CelebrationStrip flags={flags} />);
    expect(screen.getByText("Today · Design")).toBeInTheDocument();
  });

  it("says Today alone without a team", () => {
    items = [{ kind: "BIRTHDAY", userId: "u1", firstName: "Ana", lastName: "Ruiz", avatarUrl: null, date: today }];
    render(<CelebrationStrip flags={flags} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
});
