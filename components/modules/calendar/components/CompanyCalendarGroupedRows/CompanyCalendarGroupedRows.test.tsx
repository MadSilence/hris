import { fireEvent, render, screen } from "@testing-library/react";
import { CompanyCalendarGroupedRows } from "@/components/modules/calendar/components/CompanyCalendarGroupedRows/CompanyCalendarGroupedRows";
import {
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import type { CompanyCalendarGroup, CompanyCalendarUser } from "@/models/calendar";

jest.mock("@/components/modules/calendar/hooks/useCompanyCalendar", () => ({
  useCompanyCalendarPeople: jest.fn(),
  useCompanyCalendarMarks: jest.fn(),
}));

jest.mock("@/components/modules/settings/shared/UserChip/UserChip", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <span>{name}</span>,
}));

const person = (id: string, lastName: string): CompanyCalendarUser => ({
  id,
  firstName: "A",
  lastName,
  email: `${id}@example.com`,
  avatarUrl: null,
});

const day = new Date(2026, 8, 21);
const geometry = {
  days: [day],
  dayISOs: ["2026-09-21"],
  todayISO: "2026-09-21",
  isNonWorkingDay: () => false,
  density: "month" as const,
  gridTemplateColumns: "200px repeat(1, minmax(0, 1fr))",
};

const groups: CompanyCalendarGroup[] = [
  { id: "t1", name: "Platform", count: 2 },
  { id: null, name: null, count: 1 },
];

const rowsByGroup: Record<string, CompanyCalendarUser[]> = {
  t1: [person("u1", "Adams"), person("u2", "Brown")],
  none: [person("u3", "Clark")],
};

const renderRows = (collapsed: ReadonlySet<string> = new Set(), onToggle = jest.fn()) =>
  render(
    <CompanyCalendarGroupedRows
      grouping="TEAM"
      groups={groups}
      isLoading={false}
      collapsed={collapsed}
      onToggle={onToggle}
      q=""
      filters={[]}
      from="2026-09-01"
      to="2026-09-30"
      geometry={geometry}
    />,
  );

/** Reports every observed node as on screen at once — the jsdom default never fires at all. */
class OnScreenObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  unobserve() {}

  disconnect() {}
}

describe("CompanyCalendarGroupedRows", () => {
  const originalObserver = global.IntersectionObserver;

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
  });

  beforeEach(() => {
    global.IntersectionObserver = OnScreenObserver as unknown as typeof IntersectionObserver;
    (useCompanyCalendarPeople as jest.Mock).mockImplementation(
      ({ group, enabled }: { group: { id: string | null }; enabled: boolean }) => ({
        data: enabled ? { pages: [{ users: rowsByGroup[group.id ?? "none"], nextCursor: null }] } : undefined,
        isLoading: false,
        isError: false,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
      }),
    );
    (useCompanyCalendarMarks as jest.Mock).mockReturnValue({ data: [], isError: false, refetch: jest.fn() });
  });

  it("draws a header per group with its count, the no-value group named after the dimension", () => {
    renderRows();

    const platform = screen.getByRole("group", { name: "Platform" });
    const noTeam = screen.getByRole("group", { name: "No team" });
    expect(platform).toHaveTextContent("2");
    expect(noTeam).toHaveTextContent("1");
    expect(screen.getByText("A Adams")).toBeInTheDocument();
    expect(screen.getByText("A Clark")).toBeInTheDocument();
  });

  it("asks each group for its own rows, the no-value group by a null id", () => {
    renderRows();

    const asked = (useCompanyCalendarPeople as jest.Mock).mock.calls.map(([args]) => args.group);
    expect(asked).toContainEqual({ by: "TEAM", id: "t1" });
    expect(asked).toContainEqual({ by: "TEAM", id: null });
  });

  it("does not load or draw the rows of a collapsed group", () => {
    renderRows(new Set(["t1"]));

    expect(screen.queryByText("A Adams")).not.toBeInTheDocument();
    expect(screen.getByText("A Clark")).toBeInTheDocument();
    const platformCalls = (useCompanyCalendarPeople as jest.Mock).mock.calls.filter(
      ([args]) => args.group.id === "t1",
    );
    expect(platformCalls.every(([args]) => args.enabled === false)).toBe(true);
    expect(screen.getByRole("button", { name: /Platform/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("loads nothing for a group that has not come near the screen", () => {
    global.IntersectionObserver = originalObserver;
    renderRows();

    const calls = (useCompanyCalendarPeople as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every(([args]) => args.enabled === false)).toBe(true);
    expect(screen.queryByText("A Adams")).not.toBeInTheDocument();
    // The headers and their counts are there regardless: they come from one request for all groups.
    expect(screen.getByRole("group", { name: "Platform" })).toHaveTextContent("2");
  });

  it("toggles a group by its key from the header", () => {
    const onToggle = jest.fn();
    renderRows(new Set(), onToggle);

    fireEvent.click(screen.getByRole("button", { name: /No team/ }));
    expect(onToggle).toHaveBeenCalledWith("__none__");
  });

  it("shows a failed group in its own region, not across the board", () => {
    (useCompanyCalendarPeople as jest.Mock).mockImplementation(({ group }: { group: { id: string | null } }) =>
      group.id === "t1"
        ? { data: undefined, isLoading: false, isError: true, error: new Error("x"), refetch: jest.fn() }
        : {
            data: { pages: [{ users: rowsByGroup.none, nextCursor: null }] },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            refetch: jest.fn(),
          },
    );
    renderRows();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("A Clark")).toBeInTheDocument();
  });
});
