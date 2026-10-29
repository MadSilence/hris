import { fireEvent, render, screen } from "@testing-library/react";
import { CelebrationsWidget } from "./CelebrationsWidget";
import { useCelebrations } from "@/components/modules/home/hooks";
import { useCanAccess } from "@/components/auth/useAccess";
import type { Celebrations } from "@/models/home";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/home/hooks", () => ({ useCelebrations: jest.fn() }));
jest.mock("@/components/auth/useAccess", () => ({ useCanAccess: jest.fn() }));

const answer = (data: Partial<Celebrations>) =>
  jest.mocked(useCelebrations).mockReturnValue(partialMock<ReturnType<typeof useCelebrations>>({
    isLoading: false,
    error: null,
    data: {
      from: "2026-10-29", to: "2026-10-29", birthdays: "SHOWN", birthdayFieldName: "Date of birth",
      hireDates: "SHOWN", items: [], ...data,
    },
  }));

const admin = (yes: boolean) => jest.mocked(useCanAccess).mockReturnValue(yes);

describe("CelebrationsWidget", () => {
  it("shows today by default and widens to the next week under Show Upcoming", () => {
    admin(false);
    answer({});
    render(<CelebrationsWidget />);
    expect(useCelebrations).toHaveBeenLastCalledWith(false);
    expect(screen.getByText("Nothing to celebrate today.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show Upcoming" }));
    expect(useCelebrations).toHaveBeenLastCalledWith(true);
  });

  it("names each kind, today as Today and a later day without a year", () => {
    admin(false);
    answer({
      to: "2026-11-04",
      items: [
        { kind: "BIRTHDAY", userId: "a", firstName: "Anna", lastName: "K", avatarUrl: null, date: "2026-10-29" },
        { kind: "ANNIVERSARY", userId: "b", firstName: "Bob", lastName: "B", avatarUrl: null, date: "2026-11-02", years: 5 },
        { kind: "NEW_JOINER", userId: "c", firstName: "Cleo", lastName: "C", avatarUrl: null, date: "2026-11-03" },
      ],
    });
    render(<CelebrationsWidget />);

    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("5 Years at the Company")).toBeInTheDocument();
    expect(screen.getByText("Joins the Company")).toBeInTheDocument();
    expect(screen.getByText("Today", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it("tells an administrator how to open birthdays up when they are hidden from them", () => {
    admin(true);
    answer({ birthdays: "HIDDEN" });
    render(<CelebrationsWidget />);

    expect(screen.getByText(/"Date of birth" is\s+not visible to your role for everyone/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Roles" })).toHaveAttribute("href", "/settings/people/roles");
  });

  it("tells an administrator where to choose the field when none is chosen", () => {
    admin(true);
    answer({ birthdays: "OFF", birthdayFieldName: null });
    render(<CelebrationsWidget />);

    expect(screen.getByRole("link", { name: "Choose One" })).toHaveAttribute("href", "/settings/general/dashboard");
  });

  it("says nothing about hidden birthdays to somebody who could not change it", () => {
    admin(false);
    answer({ birthdays: "HIDDEN" });
    render(<CelebrationsWidget />);

    expect(screen.queryByText(/not visible to your role/)).not.toBeInTheDocument();
  });
});
