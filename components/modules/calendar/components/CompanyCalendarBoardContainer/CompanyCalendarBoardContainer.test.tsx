import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { CompanyCalendarBoardContainer } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/CompanyCalendarBoardContainer";
import {
  useCompanyCalendarGroups,
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import {
  useCalendarViewMutations,
  useCalendarViews,
} from "@/components/modules/calendar/hooks/useCalendarViews";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import type { CalendarView } from "@/models/calendarView";
import type { CompanyCalendarGrouping } from "@/models/calendar";

jest.mock("@/components/modules/organization/modules/profile/hooks/useDebouncedValue", () => ({
  useDebouncedValue: (value: string) => value,
}));
jest.mock("@/components/modules/organization/hooks/useUserFields", () => ({
  useUserFields: jest.fn(),
}));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: undefined }),
}));
jest.mock("@/components/modules/calendar/hooks/useCompanyCalendar", () => ({
  useCompanyCalendarPeople: jest.fn(),
  useCompanyCalendarGroups: jest.fn(),
  useCompanyCalendarMarks: jest.fn(),
}));
jest.mock("@/components/modules/calendar/hooks/useCalendarViews", () => ({
  useCalendarViews: jest.fn(),
  useCalendarViewMutations: jest.fn(),
}));

type ToolbarDouble = {
  grouping: CompanyCalendarGrouping | null;
  groupingOptions: CompanyCalendarGrouping[];
  onGroupingChange: (next: CompanyCalendarGrouping | null) => void;
  views: CalendarView[];
  onApplyView: (view: CalendarView | null) => void;
  onSaveView: (name: string) => void;
};

// The toolbar and the board are stand-ins: what is under test is the state between them.
jest.mock("@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarToolbar", () => ({
  CompanyCalendarToolbar: (props: ToolbarDouble) => (
    <div>
      <span data-test="grouping">{props.grouping ?? "flat"}</span>
      <span data-test="options">{props.groupingOptions.join(",")}</span>
      <button onClick={() => props.onGroupingChange("TEAM")}>group by team</button>
      <button onClick={() => props.onGroupingChange(null)}>ungroup</button>
      {props.views.map((v) => (
        <button key={v.id} onClick={() => props.onApplyView(v)}>
          open {v.name}
        </button>
      ))}
      <button onClick={() => props.onApplyView(null)}>all people</button>
      <button onClick={() => props.onSaveView("Mine")}>save</button>
    </div>
  ),
}));
jest.mock("@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard", () => ({
  CompanyCalendarBoard: ({ grouped }: { grouped?: ReactNode }) => (
    <div data-test="board">{grouped === undefined ? "flat board" : "grouped board"}</div>
  ),
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

describe("CompanyCalendarBoardContainer — grouping", () => {
  beforeEach(() => {
    (useUserFields as jest.Mock).mockReturnValue({
      data: [
        { id: "sys:department", viewScopes: ["COMPANY"] },
        { id: "sys:team", viewScopes: ["COMPANY"] },
        { id: "sys:office", viewScopes: ["SELF"] },
      ],
    });
    (useCompanyCalendarPeople as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
    (useCompanyCalendarGroups as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useCompanyCalendarMarks as jest.Mock).mockReturnValue({ data: [] });
    (useCalendarViews as jest.Mock).mockReturnValue({
      data: [view("Legacy"), view("By department", "DEPARTMENT"), view("Tampered", "nonsense")],
    });
    (useCalendarViewMutations as jest.Mock).mockReturnValue({
      create: { mutate: createView, isPending: false },
      remove: { mutate: jest.fn(), isPending: false },
    });
  });

  it("offers only the dimensions the reader may read company-wide", () => {
    render(<CompanyCalendarBoardContainer />);
    expect(screen.getByTestId("options")).toHaveTextContent("DEPARTMENT,TEAM");
  });

  it("switches the board's shape and turns the flat roster off while grouped", () => {
    render(<CompanyCalendarBoardContainer />);
    expect(screen.getByTestId("board")).toHaveTextContent("flat board");

    fireEvent.click(screen.getByText("group by team"));

    expect(screen.getByTestId("board")).toHaveTextContent("grouped board");
    expect(useCompanyCalendarGroups).toHaveBeenLastCalledWith(expect.objectContaining({ groupBy: "TEAM" }));
    expect(useCompanyCalendarPeople).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("saves the grouping with the view", () => {
    render(<CompanyCalendarBoardContainer />);
    fireEvent.click(screen.getByText("group by team"));
    fireEvent.click(screen.getByText("save"));

    expect(createView).toHaveBeenCalledWith(
      { name: "Mine", payload: { filters: [], density: "month", grouping: "TEAM" } },
      expect.anything(),
    );
  });

  it("reopens a grouped view grouped, and a view without a grouping flat", () => {
    render(<CompanyCalendarBoardContainer />);

    fireEvent.click(screen.getByText("open By department"));
    expect(screen.getByTestId("grouping")).toHaveTextContent("DEPARTMENT");

    fireEvent.click(screen.getByText("open Legacy"));
    expect(screen.getByTestId("grouping")).toHaveTextContent("flat");
  });

  it("reads a grouping it does not know as flat", () => {
    render(<CompanyCalendarBoardContainer />);
    fireEvent.click(screen.getByText("group by team"));
    fireEvent.click(screen.getByText("open Tampered"));
    expect(screen.getByTestId("grouping")).toHaveTextContent("flat");
  });

  it("leaves the grouping alone when the reader goes back to all people", () => {
    render(<CompanyCalendarBoardContainer />);
    fireEvent.click(screen.getByText("group by team"));
    fireEvent.click(screen.getByText("all people"));
    expect(screen.getByTestId("grouping")).toHaveTextContent("TEAM");
  });
});
