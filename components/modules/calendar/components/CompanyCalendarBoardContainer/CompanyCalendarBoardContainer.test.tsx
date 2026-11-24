import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { CompanyCalendarBoardContainer } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/CompanyCalendarBoardContainer";
import {
  useCompanyCalendarAbsences,
  useCompanyCalendarGroups,
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import { useCalendarViewMutations, useCalendarViews } from "@/components/modules/calendar/hooks/useCalendarViews";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import { useUser } from "@/components/hooks/useUser/useUser";
import type { CalendarView } from "@/models/calendarView";
import type { CompanyCalendarAbsence, CompanyCalendarGrouping } from "@/models/calendar";
import type { LeaveDecisions } from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import type { ViewPill } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarViewsRow";
import { holdWithUndo } from "@/lib/feedback/holdWithUndo";

let search = new URLSearchParams();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => search,
  usePathname: () => "/calendar",
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));
jest.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: jest.fn() }) }));
jest.mock("@/components/modules/organization/modules/profile/hooks/useDebouncedValue", () => ({
  useDebouncedValue: (value: string) => value,
}));
jest.mock("@/components/modules/organization/hooks/useUserFields", () => ({ useUserFields: jest.fn() }));
jest.mock("@/components/hooks/useUser/useUser", () => ({ useUser: jest.fn() }));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: undefined }),
}));
jest.mock("@/components/modules/calendar/hooks/useCompanyCalendar", () => ({
  COMPANY_CALENDAR_ABSENCES_QUERY_KEY: "absences",
  useCompanyCalendarPeople: jest.fn(),
  useCompanyCalendarGroups: jest.fn(),
  useCompanyCalendarMarks: jest.fn(),
  useCompanyCalendarAbsences: jest.fn(),
  useCompanyCalendarViewCounts: () => ({}),
}));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ userId: "me", user: { teams: [{ id: "t-design", name: "Design" }] } }),
}));
jest.mock("@/components/auth/useAccess", () => ({ useCanAccess: () => false }));
jest.mock("@/components/modules/calendar/hooks/useCalendarViews", () => ({
  useCalendarViews: jest.fn(),
  useCalendarViewMutations: jest.fn(),
}));
jest.mock("@/lib/feedback/holdWithUndo", () => ({ holdWithUndo: jest.fn() }));
jest.mock("@/components/modules/timeOff", () => ({
  DeclineLeaveDialog: ({ target }: { target: { requestId: string; firstName?: string | null } | null }) =>
    target ? <div data-test="decline-dialog">{`${target.requestId} ${target.firstName ?? ""}`}</div> : null,
}));
jest.mock("@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarShare", () => ({
  CompanyCalendarShare: () => null,
}));
jest.mock("@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarExport", () => ({
  CompanyCalendarExport: () => null,
}));

type ToolbarDouble = {
  grouping: CompanyCalendarGrouping | null;
  groupingOptions: CompanyCalendarGrouping[];
  onGroupingChange: (next: CompanyCalendarGrouping | null) => void;
  person: string | null;
  onClearPerson: () => void;
};
type ViewsDouble = {
  builtIns: ViewPill[];
  views: CalendarView[];
  activeId: string | null;
  onPick: (id: string) => void;
  onSave: (name: string) => void;
  onReorder: (ids: string[]) => void;
};
type BoardDouble = { grouped?: ReactNode; overlay?: ReactNode; decisions: LeaveDecisions; users: { id: string }[] };

// The toolbar, the views row and the board are stand-ins: what is under test is the state between them.
jest.mock("@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarToolbar", () => ({
  usePersonField: () => ({ key: "person", label: "Person", operators: ["eq"], valueSource: "people", group: "System" }),
  CompanyCalendarToolbar: (props: ToolbarDouble) => (
    <div>
      <span data-test="grouping">{props.grouping ?? "flat"}</span>
      <span data-test="options">{props.groupingOptions.join(",")}</span>
      <span data-test="person">{props.person ?? "nobody"}</span>
      <button type="button" onClick={() => props.onGroupingChange("TEAM")}>group by team</button>
      <button type="button" onClick={props.onClearPerson}>clear person</button>
    </div>
  ),
}));
jest.mock("@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarViewsRow", () => ({
  CompanyCalendarViewsRow: (props: ViewsDouble) => (
    <div>
      <span data-test="active">{props.activeId ?? "none"}</span>
      <span data-test="builtins">{props.builtIns.map((b) => b.name).join(",")}</span>
      {[...props.builtIns, ...props.views].map((v) => (
        <button type="button" key={v.id} onClick={() => props.onPick(v.id)}>
          open {v.name}
        </button>
      ))}
      <button type="button" onClick={() => props.onSave("Mine")}>save</button>
      <button type="button" onClick={() => props.onReorder(["b", "a"])}>reorder</button>
    </div>
  ),
}));
let board: BoardDouble | null = null;
jest.mock("@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard", () => ({
  CompanyCalendarBoard: (props: BoardDouble) => {
    board = props;
    return (
      <div data-test="board">
        {props.overlay ? props.overlay : props.grouped === undefined ? "flat board" : "grouped board"}
        <span data-test="rows">{props.users.map((u) => u.id).join(",")}</span>
      </div>
    );
  },
}));
jest.mock("@/components/modules/calendar/components/CompanyCalendarGroupedRows/CompanyCalendarGroupedRows", () => ({
  CompanyCalendarGroupedRows: () => null,
}));

const view = (id: string, grouping?: unknown): CalendarView => ({
  id,
  name: id,
  payload: { filters: [], density: "month", ...(grouping === undefined ? {} : { grouping }) } as CalendarView["payload"],
});

const createView = jest.fn();
const reorderViews = jest.fn();

const pending = (over: Partial<CompanyCalendarAbsence> = {}): CompanyCalendarAbsence => ({
  userId: "u1",
  startDate: "2026-12-14",
  endDate: "2026-12-18",
  status: "PENDING",
  requestId: "r1",
  awaitingYou: true,
  ...over,
});

describe("CompanyCalendarBoardContainer", () => {
  beforeEach(() => {
    search = new URLSearchParams();
    board = null;
    (useUserFields as jest.Mock).mockReturnValue({
      data: [
        { id: "sys:department", viewScopes: ["COMPANY"] },
        { id: "sys:team", viewScopes: ["COMPANY"] },
        { id: "sys:office", viewScopes: ["SELF"] },
      ],
    });
    (useUser as jest.Mock).mockReturnValue({ data: undefined, error: undefined });
    (useCompanyCalendarPeople as jest.Mock).mockReturnValue({
      data: { pages: [{ users: [{ id: "u1" }], nextCursor: null }] },
      isLoading: false,
    });
    (useCompanyCalendarGroups as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useCompanyCalendarMarks as jest.Mock).mockReturnValue({ data: [] });
    (useCompanyCalendarAbsences as jest.Mock).mockReturnValue({ data: [] });
    (useCalendarViews as jest.Mock).mockReturnValue({
      data: [view("Legacy"), view("By department", "DEPARTMENT"), view("Tampered", "nonsense")],
    });
    (useCalendarViewMutations as jest.Mock).mockReturnValue({
      create: { mutate: createView, isPending: false },
      update: { mutate: jest.fn(), isPending: false },
      remove: { mutate: jest.fn(), isPending: false },
      reorder: { mutate: reorderViews, isPending: false },
    });
    jest.mocked(holdWithUndo).mockReset().mockResolvedValue(true);
  });

  describe("grouping", () => {
    it("offers only the dimensions the reader may read company-wide", () => {
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByTestId("options")).toHaveTextContent("DEPARTMENT,TEAM");
    });

    it("switches the board's shape and turns the flat roster off while grouped", () => {
      (useCompanyCalendarGroups as jest.Mock).mockReturnValue({ data: [{ id: "t1", name: "Design", count: 3 }], isLoading: false });
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByTestId("board")).toHaveTextContent("flat board");

      fireEvent.click(screen.getByText("group by team"));

      expect(screen.getByTestId("board")).toHaveTextContent("grouped board");
      expect(useCompanyCalendarGroups).toHaveBeenLastCalledWith(expect.objectContaining({ groupBy: "TEAM" }));
      expect(useCompanyCalendarPeople).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
    });

    it("saves the grouping and the scale with the view", () => {
      render(<CompanyCalendarBoardContainer />);
      fireEvent.click(screen.getByText("group by team"));
      fireEvent.click(screen.getByText("save"));

      expect(createView).toHaveBeenCalledWith(
        { name: "Mine", payload: { filters: [], density: "month", grouping: "TEAM" } },
        expect.anything(),
      );
    });

    it("reopens a grouped view grouped, a view without a grouping flat, and one it does not know flat", () => {
      render(<CompanyCalendarBoardContainer />);

      fireEvent.click(screen.getByText("open By department"));
      expect(screen.getByTestId("grouping")).toHaveTextContent("DEPARTMENT");

      fireEvent.click(screen.getByText("open Legacy"));
      expect(screen.getByTestId("grouping")).toHaveTextContent("flat");

      fireEvent.click(screen.getByText("group by team"));
      fireEvent.click(screen.getByText("open Tampered"));
      expect(screen.getByTestId("grouping")).toHaveTextContent("flat");
    });

    it("leaves the grouping alone when the reader goes back to Everyone", () => {
      render(<CompanyCalendarBoardContainer />);
      fireEvent.click(screen.getByText("group by team"));
      fireEvent.click(screen.getByText("open Everyone"));
      expect(screen.getByTestId("grouping")).toHaveTextContent("TEAM");
    });
  });

  describe("views", () => {
    it("starts on Everyone, and offers My team to a reader with a team", () => {
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByTestId("active")).toHaveTextContent("everyone");
      expect(screen.getByTestId("builtins")).toHaveTextContent("Everyone,My team");
    });

    it("narrows My team to the reader's own teams", () => {
      render(<CompanyCalendarBoardContainer />);
      fireEvent.click(screen.getByText("open My team"));
      expect(useCompanyCalendarPeople).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: [{ field: "sys:team", op: "has_any", values: ["t-design"] }] }),
      );
    });

    it("saves a new order at once", () => {
      render(<CompanyCalendarBoardContainer />);
      fireEvent.click(screen.getByText("reorder"));
      expect(reorderViews).toHaveBeenCalledWith(["b", "a"], expect.anything());
    });
  });

  describe("the address", () => {
    it("opens a shared link as it was shared", () => {
      search = new URLSearchParams({
        f: JSON.stringify([{ field: "sys:office", op: "eq", value: "o1" }]),
        group: "department",
        scale: "week",
      });
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByTestId("grouping")).toHaveTextContent("DEPARTMENT");
      expect(useCompanyCalendarGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: [{ field: "sys:office", op: "eq", value: "o1" }] }),
      );
      expect(screen.getByTestId("active")).toHaveTextContent("none");
    });

    it("shows one person from ?person=, and no one else (F0.2)", () => {
      search = new URLSearchParams({ person: "p-ruta" });
      (useUser as jest.Mock).mockReturnValue({
        data: { firstName: "Rūta", lastName: "Jonaitė", email: "ruta@example.com", avatarUrl: null },
        error: undefined,
      });
      render(<CompanyCalendarBoardContainer />);

      expect(screen.getByTestId("person")).toHaveTextContent("p-ruta");
      expect(screen.getByTestId("rows")).toHaveTextContent("p-ruta");
      expect(useCompanyCalendarPeople).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));

      fireEvent.click(screen.getByText("clear person"));
      expect(screen.getByTestId("rows")).toHaveTextContent("u1");
    });

    it("writes the state back into the address", () => {
      jest.useFakeTimers();
      const replace = jest.spyOn(window.history, "replaceState");
      render(<CompanyCalendarBoardContainer />);
      fireEvent.click(screen.getByText("group by team"));
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(replace.mock.calls.at(-1)?.[2]).toContain("group=team");
      replace.mockRestore();
      jest.useRealTimers();
    });
  });

  describe("deciding from the card", () => {
    it("lets only whoever the request waits on decide it", () => {
      render(<CompanyCalendarBoardContainer />);
      const { canDecide } = board!.decisions;
      expect(canDecide(pending())).toBe(true);
      expect(canDecide(pending({ awaitingYou: false }))).toBe(false);
      expect(canDecide(pending({ status: "APPROVED" }))).toBe(false);
      expect(canDecide(pending({ requestId: undefined }))).toBe(false);
    });

    it("holds an approval on the server with Undo, and keeps nothing back on the page", () => {
      const { unmount } = render(<CompanyCalendarBoardContainer />);
      act(() => board!.decisions.approve(pending()));

      expect(holdWithUndo).toHaveBeenCalledTimes(1);
      expect(jest.mocked(holdWithUndo).mock.calls[0][0]).toMatchObject({
        kind: "TIME_OFF_APPROVE",
        targetId: "r1",
        message: "Time off approved",
      });
      // Leaving the page sends nothing more: the answer is already on the server.
      unmount();
      expect(holdWithUndo).toHaveBeenCalledTimes(1);
    });

    it("declines in its own small window, with the person's name (AQ-13)", () => {
      render(<CompanyCalendarBoardContainer />);
      act(() => board!.decisions.decline(pending(), "Rūta Jankauskienė"));
      expect(screen.getByTestId("decline-dialog")).toHaveTextContent("r1 Rūta");
    });

    it("opens the request in full over the board through the address (AQ-12 b)", () => {
      render(<CompanyCalendarBoardContainer />);
      render(<>{board!.decisions.openFull(pending())}</>);
      fireEvent.click(screen.getByRole("button", { name: "Open the request in full" }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/calendar\?.*leaveRequest=r1/), { scroll: false });
    });
  });

  describe("states", () => {
    it("says nobody matches the filters, with Clear all", () => {
      search = new URLSearchParams({ f: JSON.stringify([{ field: "sys:office", op: "eq", value: "o1" }]) });
      (useCompanyCalendarPeople as jest.Mock).mockReturnValue({ data: { pages: [{ users: [], nextCursor: null }] }, isLoading: false });
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByText("No one matches these filters")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
    });

    it("keeps the tools and offers Try again when the people did not load", () => {
      const refetch = jest.fn();
      (useCompanyCalendarPeople as jest.Mock).mockReturnValue({ isLoading: false, isError: true, error: new Error("x"), refetch });
      render(<CompanyCalendarBoardContainer />);
      expect(screen.getByText("We couldn’t load the calendar")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByTestId("grouping")).toBeInTheDocument();
    });
  });
});
