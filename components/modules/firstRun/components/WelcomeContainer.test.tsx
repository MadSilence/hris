import { fireEvent, render, screen } from "@testing-library/react";

import { WelcomeContainer } from "./WelcomeContainer";

const completeWelcomeAction = jest.fn();

jest.mock("@/components/modules/firstRun/actions", () => ({
  completeWelcomeAction: (...args: unknown[]) => completeWelcomeAction(...args),
  issueAvatarUploadTokenAction: jest.fn(),
  updateUserSettingsAction: jest.fn(),
}));

jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAttributesAction", () => ({
  updateUserAttributesAction: jest.fn(),
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
    data: {
      fields: [],
      values: {},
      firstName: "Jonas",
      lastName: "Berg",
      avatarUrl: null,
      completed: false,
      outstanding: true,
    },
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
      welcomeCompletedAt: null,
    },
    isLoading: false,
  }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

beforeEach(() => {
  completeWelcomeAction.mockReset();
});

describe("WelcomeContainer", () => {
  /**
   * The regression this file exists for, and it is invisible to tsc, eslint and a types check.
   *
   * `Button` sets no `type`, so a button defaults to **submit**, and React reused a single DOM node
   * for both branches of the footer's ternary. Clicking Next flushed `setStep(1)` synchronously, the
   * same node became `Finish` with `form="welcome-preferences"`, and the browser's default action
   * then submitted the preferences form — whose success handler leaves for the dashboard. One click
   * and step two was gone. Seen by a person, not by a suite.
   */
  it("goes to step two on Next, and does not finish the welcome", () => {
    render(<WelcomeContainer />);

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(completeWelcomeAction).not.toHaveBeenCalled();
  });

  it("gives every button that is not a submit an explicit type", () => {
    render(<WelcomeContainer />);

    // The rule this pins is the general one: a button whose job is not submitting must say so, or it
    // inherits a default action from whatever form it ends up associated with.
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type");
    }
  });

  it("leaves for the product on Skip, which is an answer and not a postponement", () => {
    completeWelcomeAction.mockResolvedValue({ status: "SUCCESS" });
    render(<WelcomeContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    expect(completeWelcomeAction).toHaveBeenCalled();
  });
});
