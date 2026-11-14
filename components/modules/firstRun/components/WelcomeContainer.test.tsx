import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { SignInOverviewDTO } from "@/api/modules/identity/services";
import { WelcomeContainer, type WelcomeReturn } from "./WelcomeContainer";

const completeWelcomeAction = jest.fn();
const updateUserSettingsAction = jest.fn();
const post = jest.fn();
let overview: SignInOverviewDTO;

jest.mock("@/components/desact/select", () => jest.requireActual("@/test/selectMock"));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));

jest.mock("@/components/modules/firstRun/actions", () => ({
  completeWelcomeAction: (...args: unknown[]) => completeWelcomeAction(...args),
  updateUserSettingsAction: (...args: unknown[]) => updateUserSettingsAction(...args),
  issueAvatarUploadTokenAction: jest.fn(),
}));

jest.mock("@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction", () => ({
  uploadUserAvatarAction: jest.fn(),
}));

jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAttributesAction", () => ({
  updateUserAttributesAction: jest.fn(),
}));

jest.mock("@/components/modules/identity/actions/personalSignInActions", () => ({
  setFirstPasswordAction: jest.fn(),
  removePasswordAction: jest.fn(),
  disconnectAccountAction: jest.fn(),
}));

jest.mock("@/components/modules/mfa/stepUp", () => ({
  withStepUp: <T,>(run: () => Promise<T>) => run(),
  withStepUpAction: <T,>(run: () => Promise<T>) => run(),
}));

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get: jest.fn(), post: (...args: unknown[]) => post(...args) } }),
}));

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ userId: "user-1" }),
}));

jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useAttributeGroups: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/components/modules/firstRun/hooks", () => ({
  WELCOME_QK: ["WELCOME"],
  USER_SETTINGS_QK: ["USER_SETTINGS"],
  useWelcome: () => ({
    data: { fields: [], values: {}, firstName: "Jonas", lastName: "Berg", avatarUrl: null, completed: false, outstanding: true },
    isLoading: false,
    error: null,
  }),
  useUserSettings: () => ({
    data: {
      timeZone: null,
      companyTimeZone: "UTC",
      dateFormat: "SYSTEM",
      timeFormat: "SYSTEM",
      language: null,
      companyLanguage: "en",
      welcomeCompletedAt: null,
    },
    isLoading: false,
  }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useQuery: () => ({ data: overview }),
}));

const acme = { name: "Acme", logoUrl: null };
const show = (returned: WelcomeReturn = null) => render(<WelcomeContainer company={acme} returned={returned} />);

beforeEach(() => {
  completeWelcomeAction.mockReset();
  updateUserSettingsAction.mockReset();
  post.mockReset();
  overview = { hasPassword: true, accounts: [], offered: ["GOOGLE", "MICROSOFT"], passwordRemovable: false };
});

/** first-run-welcome W0–W4, read through the real catalogue. */
describe("WelcomeContainer", () => {
  it("W0 greets by first name, and Let's go opens W1 when the company offers Google and Microsoft", () => {
    show();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hi, Jonas!Glad you’re here");
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));

    expect(screen.getByRole("heading", { name: "Log in faster next time" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect Microsoft" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set a password instead" })).not.toBeInTheDocument();
  });

  it("W1 offers a password to somebody who has none", () => {
    overview = { hasPassword: false, accounts: [], offered: ["GOOGLE"], passwordRemovable: false };
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));

    expect(screen.getByText("Connect Google and skip the password from now on.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set a password instead" })).toBeInTheDocument();
  });

  it("Connect starts the round trip back to the welcome", async () => {
    post.mockReturnValue(new Promise(() => {}));
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect Google" }));

    await waitFor(() => expect(post).toHaveBeenCalledWith("/auth/provider/person",
      { purpose: "CONNECT", provider: "GOOGLE", returnTo: "/welcome" }));
    expect(screen.getByRole("button", { name: "Taking you to Google…" })).toBeInTheDocument();
  });

  it("without providers, or with one already connected, W1 is skipped and the photo counts two steps", () => {
    overview = { hasPassword: true, accounts: [], offered: [], passwordRemovable: false };
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));

    expect(screen.getByRole("heading", { name: "Add your photo" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2 · Profile")).toBeInTheDocument();
    expect(screen.getByText("Drag your photo here")).toBeInTheDocument();
    // No Continue until there is a photo.
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
  });

  it("W1a: back from the provider, it says which account and continues", () => {
    overview = {
      hasPassword: true,
      accounts: [{ provider: "GOOGLE", email: "jonas@gmail.test", connectedAt: "2026-11-13T10:00:00Z", lastUsedAt: null }],
      offered: ["GOOGLE", "MICROSOFT"],
      passwordRemovable: true,
    };
    show({ kind: "connected" });

    expect(screen.getByText("Connected as jonas@gmail.test.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Add your photo" })).toBeInTheDocument();
  });

  it("W1b: an account somebody else here uses, and a provider that failed, each say so", () => {
    const { unmount } = show({ kind: "inUse", provider: "GOOGLE" });
    expect(screen.getByText("This Google account is already used by someone else at Acme. Try another one, or skip.")).toBeInTheDocument();
    unmount();

    show({ kind: "failed", provider: "MICROSOFT" });
    expect(screen.getByText("We couldn’t connect your Microsoft account. Try again, or skip.")).toBeInTheDocument();
  });

  it("W4 asks the time zone and the language — not the date format — and Finish saves only what changed", async () => {
    completeWelcomeAction.mockResolvedValue({ status: "SUCCESS" });
    updateUserSettingsAction.mockResolvedValue({ status: "SUCCESS" });
    overview = { hasPassword: true, accounts: [], offered: [], passwordRemovable: false };
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    expect(screen.getByText("Step 2 of 2 · Preferences")).toBeInTheDocument();
    expect(screen.getByText("We’ve used Acme’s settings. Change them if they don’t fit you.")).toBeInTheDocument();
    expect(screen.queryByText("Date format")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("en");

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "ru" } });
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    await waitFor(() => expect(updateUserSettingsAction).toHaveBeenCalledWith({ language: "ru" }));
    await waitFor(() => expect(completeWelcomeAction).toHaveBeenCalled());
  });

  it("Skip on the last step leaves without saving — skipping is an answer, not a postponement", async () => {
    completeWelcomeAction.mockResolvedValue({ status: "SUCCESS" });
    overview = { hasPassword: true, accounts: [], offered: [], passwordRemovable: false };
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    await waitFor(() => expect(completeWelcomeAction).toHaveBeenCalled());
    expect(updateUserSettingsAction).not.toHaveBeenCalled();
  });

  it("gives every button an explicit type", () => {
    show();
    fireEvent.click(screen.getByRole("button", { name: "Let’s go" }));

    // A button whose job is not submitting must say so, or it inherits a default action from a form.
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type");
    }
  });
});
