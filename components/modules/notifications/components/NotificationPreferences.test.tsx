import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserSettingsDTO } from "@/api/modules/firstRun/dto/UserSettingsDTO";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { NotificationPreference } from "@/models/notifications";
import { partialMock } from "@/test/types";
import { NotificationPreferences } from "./NotificationPreferences";

const mutate = jest.fn();
const setQueryData = jest.fn();
const updateUserSettingsAction = jest.fn();
const showActionError = jest.fn();

let preferencesQuery: { data: NotificationPreference[] | undefined; isLoading: boolean };
let setPreferenceState: { isPending: boolean; variables?: { category: string } };
let settingsQuery: { data: UserSettingsDTO | undefined; isLoading: boolean };

jest.mock("@/components/desact/select", () => jest.requireActual("@/test/selectMock"));

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ setQueryData: (...args: unknown[]) => setQueryData(...args) }),
}));

jest.mock("@/components/modules/notifications/hooks/useNotificationPreferences", () => ({
  useNotificationPreferences: () => preferencesQuery,
  useSetNotificationPreference: () => ({ ...setPreferenceState, mutate: (...args: unknown[]) => mutate(...args) }),
}));

jest.mock("@/components/modules/firstRun/hooks", () => ({
  USER_SETTINGS_QK: ["USER_SETTINGS"],
  useUserSettings: () => settingsQuery,
}));

jest.mock("@/components/modules/firstRun/actions", () => ({
  updateUserSettingsAction: (...args: unknown[]) => updateUserSettingsAction(...args),
}));

jest.mock("@/lib/errors/errorToast", () => ({
  showActionError: (...args: unknown[]) => showActionError(...args),
}));

const pref = (over: Partial<NotificationPreference> = {}): NotificationPreference => ({
  category: "APPROVALS",
  label: "Approvals",
  enabled: true,
  mandatory: false,
  canManage: true,
  emailAvailable: true,
  emailEnabled: true,
  emailLocked: false,
  ...over,
});

const inAppSwitch = (label: string) => screen.getByRole("switch", { name: `Toggle ${label}` });
const emailSwitch = (label: string) => screen.getByRole("switch", { name: `Email for ${label}` });

beforeEach(() => {
  preferencesQuery = { data: [pref()], isLoading: false };
  setPreferenceState = { isPending: false };
  settingsQuery = { data: partialMock<UserSettingsDTO>({ digestHour: 9 }), isLoading: false };
});

describe("NotificationPreferences — states", () => {
  it("shows no categories while loading", () => {
    preferencesQuery = { data: undefined, isLoading: true };
    render(<NotificationPreferences />);

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText("No configurable categories yet.")).not.toBeInTheDocument();
  });

  it("says so when there is nothing to configure", () => {
    preferencesQuery = { data: [], isLoading: false };
    render(<NotificationPreferences />);

    expect(screen.getByText("No configurable categories yet.")).toBeInTheDocument();
    expect(screen.queryByText("Daily email")).not.toBeInTheDocument();
  });

  it("lists every category under the two channel columns", () => {
    preferencesQuery = { data: [pref(), pref({ category: "TASKS", label: "Tasks" })], isLoading: false };
    render(<NotificationPreferences />);

    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("In the app")).toBeInTheDocument();
    expect(screen.getByText("By email")).toBeInTheDocument();
    expect(inAppSwitch("Approvals")).toBeChecked();
    expect(inAppSwitch("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Daily email")).toBeInTheDocument();
  });
});

describe("NotificationPreferences — a row", () => {
  it("switches the inbox channel of a category", async () => {
    render(<NotificationPreferences />);

    await userEvent.click(inAppSwitch("Approvals"));

    expect(mutate).toHaveBeenCalledWith({ category: "APPROVALS", enabled: false, channel: "IN_APP" });
  });

  it("switches the email channel of a category", async () => {
    render(<NotificationPreferences />);

    await userEvent.click(emailSwitch("Approvals"));

    expect(mutate).toHaveBeenCalledWith({ category: "APPROVALS", enabled: false, channel: "EMAIL" });
  });

  it("locks a mandatory category and says why", () => {
    preferencesQuery = { data: [pref({ mandatory: true })], isLoading: false };
    render(<NotificationPreferences />);

    expect(inAppSwitch("Approvals")).toBeDisabled();
    expect(screen.getByText("Always on — required notifications can't be turned off.")).toBeInTheDocument();
  });

  it("locks both channels of a category the organization manages", () => {
    preferencesQuery = { data: [pref({ canManage: false })], isLoading: false };
    render(<NotificationPreferences />);

    expect(inAppSwitch("Approvals")).toBeDisabled();
    expect(emailSwitch("Approvals")).toBeDisabled();
    expect(
      screen.getByText("Managed by your organization — you can't opt out of this category."),
    ).toBeInTheDocument();
  });

  it("locks only the email of a category that is always emailed", () => {
    preferencesQuery = { data: [pref({ emailLocked: true })], isLoading: false };
    render(<NotificationPreferences />);

    expect(inAppSwitch("Approvals")).toBeEnabled();
    expect(emailSwitch("Approvals")).toBeDisabled();
    expect(screen.getByText("Always emailed — it asks you to act or is about your account.")).toBeInTheDocument();
  });

  it("with the inbox off, shows email off and locked, and says how to get it back", () => {
    preferencesQuery = { data: [pref({ enabled: false, emailEnabled: true })], isLoading: false };
    render(<NotificationPreferences />);

    expect(emailSwitch("Approvals")).not.toBeChecked();
    expect(emailSwitch("Approvals")).toBeDisabled();
    expect(screen.getByText("Turn the app on to get emails too.")).toBeInTheDocument();
  });

  it("shows a dash instead of an email switch for a category never emailed", () => {
    preferencesQuery = { data: [pref({ emailAvailable: false })], isLoading: false };
    render(<NotificationPreferences />);

    expect(screen.queryByRole("switch", { name: "Email for Approvals" })).not.toBeInTheDocument();
    expect(screen.getByTitle("Not emailed")).toHaveTextContent("—");
  });

  it("disables only the row whose change is in flight", () => {
    preferencesQuery = { data: [pref(), pref({ category: "TASKS", label: "Tasks" })], isLoading: false };
    setPreferenceState = { isPending: true, variables: { category: "APPROVALS" } };
    render(<NotificationPreferences />);

    expect(inAppSwitch("Approvals")).toBeDisabled();
    expect(emailSwitch("Approvals")).toBeDisabled();
    expect(inAppSwitch("Tasks")).toBeEnabled();
  });
});

describe("NotificationPreferences — the daily email's hour", () => {
  const hourSelect = () => screen.getByRole("combobox");

  it("shows the person's hour among the five offered", () => {
    render(<NotificationPreferences />);

    expect(hourSelect()).toHaveValue("9");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Select",
      "At 07:00",
      "At 08:00",
      "At 09:00",
      "At 10:00",
      "At 17:00",
    ]);
  });

  it("defaults to eight when the settings carry no hour", () => {
    settingsQuery = { data: undefined, isLoading: false };
    render(<NotificationPreferences />);

    expect(hourSelect()).toHaveValue("8");
  });

  it("shows no picker while the settings load", () => {
    settingsQuery = { data: undefined, isLoading: true };
    render(<NotificationPreferences />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Daily email")).toBeInTheDocument();
  });

  it("saves a new hour and puts the answer into the cache", async () => {
    const saved = partialMock<UserSettingsDTO>({ digestHour: 17 });
    updateUserSettingsAction.mockResolvedValue({ status: ActionStatus.SUCCESS, data: saved });
    render(<NotificationPreferences />);

    fireEvent.change(hourSelect(), { target: { value: "17" } });

    expect(updateUserSettingsAction).toHaveBeenCalledWith({ digestHour: 17 });
    await waitFor(() => expect(setQueryData).toHaveBeenCalledWith(["USER_SETTINGS"], saved));
    expect(showActionError).not.toHaveBeenCalled();
  });

  it("shows a refusal and leaves the cache alone", async () => {
    const refusal = { status: ActionStatus.ERROR, errorMessage: "Not allowed" };
    updateUserSettingsAction.mockResolvedValue(refusal);
    render(<NotificationPreferences />);

    fireEvent.change(hourSelect(), { target: { value: "7" } });

    await waitFor(() => expect(showActionError).toHaveBeenCalledWith(refusal));
    expect(setQueryData).not.toHaveBeenCalled();
    expect(hourSelect()).toBeEnabled();
  });
});
