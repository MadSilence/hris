import { fireEvent, render, screen } from "@testing-library/react";
import { WhosOutWidget } from "./WhosOutWidget";
import { useWhosOut } from "@/components/modules/home/hooks";
import type { WhosOut, WhosOutPerson } from "@/models/home";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/home/hooks", () => ({ useWhosOut: jest.fn() }));

const person = (over: Partial<WhosOutPerson>): WhosOutPerson => ({
  userId: "u1", firstName: "Anna", lastName: "Kowalska", avatarUrl: null,
  startDate: "2026-10-29", endDate: "2026-10-29", status: "APPROVED", ...over,
});

type Result = ReturnType<typeof useWhosOut>;

const answer = (data: Partial<WhosOut>, over: { data?: undefined; error?: Error; refetch?: () => void } = {}) =>
  jest.mocked(useWhosOut).mockReturnValue(partialMock<Result>({
    isLoading: false,
    error: null,
    data: { range: "TODAY", audience: "TEAM", from: "2026-10-29", to: "2026-10-29", hasTeam: true, people: [], more: 0, ...data },
    ...over,
  } as Partial<Result>));

describe("WhosOutWidget", () => {
  it("asks for the reader's team today by default, and for everyone or the week when toggled", () => {
    answer({});
    render(<WhosOutWidget />);
    expect(useWhosOut).toHaveBeenLastCalledWith("TODAY", "TEAM");

    fireEvent.click(screen.getByRole("button", { name: "Everyone" }));
    expect(useWhosOut).toHaveBeenLastCalledWith("TODAY", "EVERYONE");

    fireEvent.click(screen.getByRole("button", { name: "This Week" }));
    expect(useWhosOut).toHaveBeenLastCalledWith("WEEK", "EVERYONE");
    expect(screen.getByRole("button", { name: "This Week" })).toHaveAttribute("aria-pressed", "true");
  });

  it("says Time Off where the leave type was not disclosed, and marks a pending request", () => {
    answer({
      people: [
        person({ userId: "masked" }),
        person({ userId: "open", firstName: "Bob", status: "PENDING", leaveTypeName: "Vacation", leaveTypeColor: "#0f0", requestId: "r1" }),
      ],
    });
    render(<WhosOutWidget />);

    expect(screen.getByText("Time Off")).toBeInTheDocument();
    expect(screen.getByText("Vacation")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    // Only the request the reader may open is a link.
    expect(screen.getByRole("link", { name: /Bob Kowalska/ })).toHaveAttribute("href", "/time-off/requests/r1");
    expect(screen.queryByRole("link", { name: /Anna Kowalska/ })).not.toBeInTheDocument();
  });

  it("says why the team list is empty for somebody in no team, and offers Everyone", () => {
    answer({ hasTeam: false });
    render(<WhosOutWidget />);

    expect(screen.getByText("You are not in a team or a department yet.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show Everyone" }));
    expect(useWhosOut).toHaveBeenLastCalledWith("TODAY", "EVERYONE");
  });

  it("says everyone is in when nobody is away", () => {
    answer({});
    render(<WhosOutWidget />);

    expect(screen.getByText("Everyone's in today.")).toBeInTheDocument();
  });

  it("fails on its own, with a retry inside the card", () => {
    const refetch = jest.fn();
    answer({}, { data: undefined, error: new Error("boom"), refetch });
    render(<WhosOutWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Who's Out" })).toBeInTheDocument();
  });
});
