import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { HomeContainer } from "./HomeContainer";
import { useAccess, useCanAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import type { EffectiveAccess, ResourceAccess, ResourceCode } from "@/models/access";
import type { HomeWidgetPlacement } from "@/models/home";
import type { UserSettingsDTO } from "@/api/modules/firstRun/dto";
import { partialMock } from "@/test/types";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/auth/useAccess", () => ({ useAccess: jest.fn(), useCanAccess: jest.fn() }));
jest.mock("@/components/modules/firstRun/hooks", () => ({ useUserSettings: jest.fn() }));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/components/modules/auth/hooks/useSignOut", () => ({ useSignOut: () => jest.fn() }));
jest.mock("@/components/modules/search/hooks", () => ({ useGlobalSearch: () => ({ groups: [], isLoading: false }) }));
jest.mock("@/components/modules/home/hooks", () => ({
  useSaveHomeSettings: () => ({ mutate: jest.fn(), isPending: false }),
  homeQueryKeys: { root: ["HOME"] },
}));
jest.mock("./HomeRequestTimeOff", () => ({
  HomeRequestTimeOffProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRequestTimeOff: () => null,
}));

// A declaration, not a const: the mocks below are hoisted above everything else in the file.
function mockStub(name: string) {
  const Stub = ({ size }: { size: string }) => <div>{`${name} body ${size}`}</div>;
  return Stub;
}
jest.mock("@/components/modules/home/widgets/WaitingOnYouWidget", () => ({ WaitingOnYouWidget: mockStub("Waiting on you") }));
jest.mock("@/components/modules/home/widgets/TimeOffWidget", () => ({ TimeOffWidget: mockStub("Time off") }));
jest.mock("@/components/modules/home/widgets/NextTimeOffWidget", () => ({ NextTimeOffWidget: mockStub("Next time off") }));
jest.mock("@/components/modules/home/widgets/MyTasksWidget", () => ({ MyTasksWidget: mockStub("My tasks") }));
jest.mock("@/components/modules/home/widgets/WhosOutWidget", () => ({ WhosOutWidget: mockStub("Who's out") }));
jest.mock("@/components/modules/home/widgets/ThisWeekWidget", () => ({ ThisWeekWidget: mockStub("This week") }));
jest.mock("@/components/modules/home/widgets/ProcessesWidget", () => ({ ProcessesWidget: mockStub("Processes") }));
jest.mock("@/components/modules/home/widgets/AutomationsWidget", () => ({ AutomationsWidget: mockStub("Automations") }));

const accessWith = (permissions: Partial<Record<ResourceCode, ResourceAccess>>): EffectiveAccess => ({
  systemOwner: false, permissions, fields: {}, moduleSummary: {}, accessHash: "h",
});

const EMPLOYEE = accessWith({
  "PEOPLE.PROFILE": { VIEW: ["COMPANY"] },
  "PEOPLE.CALENDAR": { VIEW: ["COMPANY"] },
  "PEOPLE.TIME_OFF": { VIEW: ["SELF"], EDIT: ["SELF"] },
});

const given = (access: EffectiveAccess | null, homeLayout: HomeWidgetPlacement[] = [], homeHeader: "COLOUR" | "LIGHT" = "COLOUR") => {
  jest.mocked(useAccess).mockReturnValue(partialMock<ReturnType<typeof useAccess>>({ access, loading: false }));
  jest.mocked(useCanAccess).mockReturnValue(true);
  jest.mocked(useUserSettings).mockReturnValue(partialMock<ReturnType<typeof useUserSettings>>({
    isLoading: false,
    data: partialMock<UserSettingsDTO>({ companyTimeZone: "Europe/Warsaw", timeZone: null, homeLayout, homeHeader, homeSkipped: [] }),
  }));
};

beforeEach(() => {
  jest.mocked(useCurrentUser).mockReturnValue(partialMock<ReturnType<typeof useCurrentUser>>({
    userId: "me", user: partialMock({ firstName: "Anna", lastName: "Lee" }),
  }));
});

describe("HomeContainer", () => {
  it("greets the reader by name, with My profile and the AI box", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Good (morning|afternoon|evening), Anna$/);
    expect(screen.getByRole("button", { name: "My profile menu" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ask, search or tell noddo what to do" })).toBeInTheDocument();
  });

  it("leaves the clock and the date out of the server's render, so it hydrates (walk of 2026-10-29)", () => {
    given(EMPLOYEE);
    expect(renderToString(<HomeContainer />)).toContain("Welcome");
  });

  it("starts an employee on their role's default, each widget at its size", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    expect(screen.getByText("Time off body M")).toBeInTheDocument();
    expect(screen.getByText("Next time off body S")).toBeInTheDocument();
    expect(screen.getByText("My tasks body L")).toBeInTheDocument();
    expect(screen.getByText("This week body M")).toBeInTheDocument();
    expect(screen.queryByText(/Waiting on you body/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Processes body/)).not.toBeInTheDocument();
  });

  it("draws the person's own order and sizes", () => {
    given(EMPLOYEE, [
      { id: "whos-out", hidden: false, size: "S" },
      { id: "my-tasks", hidden: false, size: "M" },
      { id: "waiting-on-you", hidden: true },
      { id: "my-time-off", hidden: true },
      { id: "next-time-off", hidden: true },
      { id: "celebrations", hidden: true },
    ]);
    render(<HomeContainer />);

    const bodies = screen.getAllByText(/ body /).map((el) => el.textContent);
    expect(bodies).toEqual(["Who's out body S", "My tasks body M"]);
  });

  it("says the home is empty when every widget was removed, and offers Edit home", () => {
    given(EMPLOYEE, ["waiting-on-you", "my-time-off", "next-time-off", "my-tasks", "whos-out", "celebrations"].map((id) => ({ id, hidden: true })));
    render(<HomeContainer />);

    expect(screen.getByText("Your home is empty")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit home" }));
    expect(screen.getByText("Try things out. Nothing changes until you press Save.")).toBeInTheDocument();
    expect(screen.getByText("Drag widgets here")).toBeInTheDocument();
  });

  it("opens Edit home from the end of the page, and Cancel with no changes closes it without asking", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Edit home" }));
    expect(screen.getByRole("complementary", { name: "Widgets" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("complementary", { name: "Widgets" })).not.toBeInTheDocument();
  });

  it("asks before dropping changes", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Edit home" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Next time off" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Discard your changes?")).toBeInTheDocument();
  });
});
