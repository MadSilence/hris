import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { UnsubscribeResult } from "@/models/email";
import { UnsubscribeContainer } from "./UnsubscribeContainer";

const unsubscribeEmailAction = jest.fn();
const undoUnsubscribeEmailAction = jest.fn();

jest.mock("@/components/modules/email/actions", () => ({
  unsubscribeEmailAction: (...args: unknown[]) => unsubscribeEmailAction(...args),
  undoUnsubscribeEmailAction: (...args: unknown[]) => undoUnsubscribeEmailAction(...args),
}));

const done = (categories: string[]): { status: ActionStatus; data: UnsubscribeResult } => ({
  status: ActionStatus.SUCCESS,
  data: { categories, done: true },
});

describe("UnsubscribeContainer", () => {
  it("says the link does not work when there is no token, and calls nothing", () => {
    render(<UnsubscribeContainer token={null} />);

    expect(screen.getByRole("heading", { name: "This link no longer works" })).toBeInTheDocument();
    expect(
      screen.getByText("Log in and change what you get by email in your notification settings."),
    ).toBeInTheDocument();
    expect(unsubscribeEmailAction).not.toHaveBeenCalled();
  });

  it("shows that it is working, then names the categories switched off", async () => {
    unsubscribeEmailAction.mockResolvedValue(done(["APPROVALS", "COMPANY_NEWS"]));
    render(<UnsubscribeContainer token="tok-1" />);

    expect(screen.getByText("Switching them off…")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "You won't get these emails" })).toBeInTheDocument();
    expect(unsubscribeEmailAction).toHaveBeenCalledTimes(1);
    expect(unsubscribeEmailAction).toHaveBeenCalledWith("tok-1");
    expect(
      screen.getByText("Approvals, Company news emails are off. Your inbox still shows everything."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email settings" })).toHaveAttribute("href", "/preferences");
  });

  it("says nothing changed, and offers no undo, when every email in the link always goes", async () => {
    unsubscribeEmailAction.mockResolvedValue(done([]));
    render(<UnsubscribeContainer token="tok-1" />);

    expect(
      await screen.findByText(
        "Nothing changed: these emails ask you to act or are about your account, so they always go.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("says the link does not work when the backend refuses it", async () => {
    unsubscribeEmailAction.mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "expired" });
    render(<UnsubscribeContainer token="tok-1" />);

    expect(await screen.findByRole("heading", { name: "This link no longer works" })).toBeInTheDocument();
  });

  it("undoes with the same token and says the emails are back", async () => {
    unsubscribeEmailAction.mockResolvedValue(done(["TASKS"]));
    undoUnsubscribeEmailAction.mockResolvedValue(done(["TASKS"]));
    render(<UnsubscribeContainer token="tok-1" />);

    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    expect(undoUnsubscribeEmailAction).toHaveBeenCalledWith("tok-1");
    expect(await screen.findByText("These emails are back on.")).toBeInTheDocument();
  });

  it("says the link does not work when the undo is refused", async () => {
    unsubscribeEmailAction.mockResolvedValue(done(["TASKS"]));
    undoUnsubscribeEmailAction.mockResolvedValue({ status: ActionStatus.ERROR });
    render(<UnsubscribeContainer token="tok-1" />);

    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    expect(await screen.findByRole("heading", { name: "This link no longer works" })).toBeInTheDocument();
  });

  it("unsubscribes once even when re-rendered with the same token", async () => {
    unsubscribeEmailAction.mockResolvedValue(done(["TASKS"]));
    const { rerender } = render(<UnsubscribeContainer token="tok-1" />);
    rerender(<UnsubscribeContainer token="tok-1" />);

    await screen.findByRole("heading", { name: "You won't get these emails" });
    expect(unsubscribeEmailAction).toHaveBeenCalledTimes(1);
  });
});
