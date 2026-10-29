import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { HomeContainer } from "./HomeContainer";
import { useAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUnreadNotificationsCount } from "@/components/modules/notifications/hooks/useUnreadNotificationsCount";
import { useSaveHomeLayout } from "@/components/modules/home/hooks";
import type { EffectiveAccess, ResourceAccess, ResourceCode } from "@/models/access";
import type { HomeWidgetPlacement } from "@/models/home";
import type { UserSettingsDTO } from "@/api/modules/firstRun/dto";
import { partialMock } from "@/test/types";

jest.mock("@/components/auth/useAccess", () => ({ useAccess: jest.fn(), useCanAccess: jest.fn() }));
jest.mock("@/components/modules/firstRun/hooks", () => ({ useUserSettings: jest.fn() }));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/components/modules/notifications/hooks/useUnreadNotificationsCount", () => ({
  useUnreadNotificationsCount: jest.fn(),
}));
jest.mock("@/components/modules/home/hooks", () => ({ useSaveHomeLayout: jest.fn() }));

// A declaration, not a const: the mocks below are hoisted above everything else in the file.
function mockStub(name: string) {
  const Stub = () => <div>{`${name} body`}</div>;
  return Stub;
}
jest.mock("@/components/modules/home/widgets/WaitingOnYouWidget", () => ({ WaitingOnYouWidget: mockStub("Waiting on You") }));
jest.mock("@/components/modules/home/widgets/MyTasksWidget", () => ({ MyTasksWidget: mockStub("My Tasks") }));
jest.mock("@/components/modules/home/widgets/MyLeaveWidget", () => ({ MyLeaveWidget: mockStub("My Time Off") }));
jest.mock("@/components/modules/home/widgets/WhosOutWidget", () => ({ WhosOutWidget: mockStub("Who's Out") }));
jest.mock("@/components/modules/home/widgets/CelebrationsWidget", () => ({ CelebrationsWidget: mockStub("Celebrations") }));
jest.mock("@/components/modules/home/widgets/UpcomingHolidaysWidget", () => ({ UpcomingHolidaysWidget: mockStub("Upcoming Holidays") }));
jest.mock("@/components/modules/home/widgets/ProcessesWidget", () => ({ ProcessesWidget: mockStub("Processes") }));
jest.mock("@/components/modules/home/widgets/AutomationsWidget", () => ({ AutomationsWidget: mockStub("Automations") }));
jest.mock("@/components/modules/home/widgets/QuickActionsWidget", () => ({ QuickActionsWidget: mockStub("Quick Actions") }));
jest.mock("@/components/modules/home/widgets/ClockWidget", () => ({ ClockWidget: mockStub("Company Time") }));

const accessWith = (permissions: Partial<Record<ResourceCode, ResourceAccess>>): EffectiveAccess => ({
  systemOwner: false, permissions, fields: {}, moduleSummary: {}, accessHash: "h",
});

const EMPLOYEE = accessWith({
  "PEOPLE.PROFILE": { VIEW: ["COMPANY"] },
  "PEOPLE.CALENDAR": { VIEW: ["COMPANY"] },
});

const mutateAsync = jest.fn();

const given = (access: EffectiveAccess | null, homeLayout: HomeWidgetPlacement[] = []) => {
  jest.mocked(useAccess).mockReturnValue(partialMock<ReturnType<typeof useAccess>>({ access, loading: false }));
  jest.mocked(useUserSettings).mockReturnValue(partialMock<ReturnType<typeof useUserSettings>>({
    isLoading: false,
    data: partialMock<UserSettingsDTO>({ companyTimeZone: "Europe/Warsaw", timeZone: null, homeLayout }),
  }));
};

beforeEach(() => {
  jest.mocked(useCurrentUser).mockReturnValue(partialMock<ReturnType<typeof useCurrentUser>>({
    userId: "me", user: partialMock({ firstName: "Anna" }),
  }));
  jest.mocked(useUnreadNotificationsCount).mockReturnValue(partialMock<ReturnType<typeof useUnreadNotificationsCount>>({ data: 3 }));
  mutateAsync.mockResolvedValue({});
  jest.mocked(useSaveHomeLayout).mockReturnValue(partialMock<ReturnType<typeof useSaveHomeLayout>>({ mutateAsync, isPending: false }));
});

describe("HomeContainer", () => {
  it("greets the reader by name and links what is unread", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Good (morning|afternoon|evening), Anna$/);
    expect(screen.getByRole("link", { name: "Unread: 3" })).toHaveAttribute("href", "/inbox?filter=unread");
  });

  it("leaves the clock and the date out of the server's render, so it hydrates (walk of 2026-10-29)", () => {
    given(EMPLOYEE);
    const html = renderToString(<HomeContainer />);

    // The server knows neither the reader's clock nor their date format; what it draws, the browser must match.
    expect(html).toContain("Welcome");
    expect(html).not.toMatch(/Good (morning|afternoon|evening)/);
    expect(html).not.toMatch(/2026/);
  });

  it("draws only the widgets the reader may see", () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    expect(screen.getByText("Who's Out body")).toBeInTheDocument();
    expect(screen.getByText("Celebrations body")).toBeInTheDocument();
    expect(screen.getByText("My Tasks body")).toBeInTheDocument();
    // No PEOPLE.TIME_OFF, no lifecycle, no automations, no actions to take.
    expect(screen.queryByText("Waiting on You body")).not.toBeInTheDocument();
    expect(screen.queryByText("My Time Off body")).not.toBeInTheDocument();
    expect(screen.queryByText("Processes body")).not.toBeInTheDocument();
    expect(screen.queryByText("Automations body")).not.toBeInTheDocument();
    expect(screen.queryByText("Quick Actions body")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "HR" })).not.toBeInTheDocument();
  });

  it("does not draw a widget the reader hid, and keeps their order inside a group", () => {
    given(EMPLOYEE, [
      { id: "upcoming-holidays", hidden: false },
      { id: "celebrations", hidden: true },
      { id: "whos-out", hidden: false },
    ]);
    render(<HomeContainer />);

    expect(screen.queryByText("Celebrations body")).not.toBeInTheDocument();
    const company = screen.getByRole("region", { name: "Company" });
    const bodies = within(company).getAllByText(/ body$/).map((node) => node.textContent);
    expect(bodies).toEqual(["Upcoming Holidays body", "Who's Out body"]);
  });

  it("offers in Customize only what the reader may see, and saves a hide and a move in one write", async () => {
    given(EMPLOYEE);
    render(<HomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    expect(screen.queryByTestId("customize-automations")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customize-waiting-on-you")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Show Celebrations" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Upcoming Holidays Up" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    const saved = mutateAsync.mock.calls[0][0] as HomeWidgetPlacement[];
    const company = saved.filter((p) => ["whos-out", "celebrations", "upcoming-holidays"].includes(p.id));
    expect(company).toEqual([
      { id: "whos-out", hidden: false },
      { id: "upcoming-holidays", hidden: false },
      { id: "celebrations", hidden: true },
    ]);
  });

  it("cancels without writing, and resets to the default with an empty arrangement", async () => {
    given(EMPLOYEE, [{ id: "celebrations", hidden: true }]);
    render(<HomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByText("Celebrations body")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset to Default" }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith([]));
  });

  it("keeps Customize open and says why when the save is refused", async () => {
    given(EMPLOYEE);
    mutateAsync.mockRejectedValue(new Error("Could not save."));
    render(<HomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(await screen.findByText("Could not save.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customize Home" })).toBeInTheDocument();
  });

  it("draws no widget before it knows what the reader may see", () => {
    jest.mocked(useAccess).mockReturnValue(partialMock<ReturnType<typeof useAccess>>({ access: null, loading: true }));
    jest.mocked(useUserSettings).mockReturnValue(partialMock<ReturnType<typeof useUserSettings>>({ isLoading: false, data: undefined }));
    render(<HomeContainer />);

    expect(screen.queryByText(/ body$/)).not.toBeInTheDocument();
  });
});
