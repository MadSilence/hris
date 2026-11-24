import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast, Toaster } from "sonner";
import { ActionStatus } from "@/components/models/ActionStatus";
import { messageForCode } from "@/lib/errors/errorMessages";
import {
  applyHeldActionAction,
  cancelHeldActionAction,
  holdActionAction,
} from "@/components/modules/heldActions/actions";
import { APPLIED_SETTLE_MS, HELD_ACTION_ALREADY_APPLIED, holdWithUndo } from "./holdWithUndo";

jest.mock("@/components/modules/heldActions/actions", () => ({
  holdActionAction: jest.fn(),
  cancelHeldActionAction: jest.fn(),
  applyHeldActionAction: jest.fn(),
}));

const held = (windowMs: number) => ({
  status: ActionStatus.SUCCESS,
  data: { id: "h1", executeAt: new Date(Date.now() + windowMs).toISOString(), windowMs },
});
const done = { status: ActionStatus.SUCCESS } as const;

const approve = (invalidate: () => unknown = jest.fn()) =>
  holdWithUndo({ kind: "TIME_OFF_APPROVE", targetId: "r1", message: "Time off approved", invalidate });

const undoButton = () => screen.findByRole("button", { name: /undo/i });

describe("holdWithUndo", () => {
  beforeEach(() => {
    jest.mocked(holdActionAction).mockReset().mockResolvedValue(held(5000));
    jest.mocked(cancelHeldActionAction).mockReset().mockResolvedValue(done);
    jest.mocked(applyHeldActionAction).mockReset().mockResolvedValue(done);
  });
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it("sends the answer at once, with the direct endpoint's body, and re-reads the lists", async () => {
    render(<Toaster />);
    const invalidate = jest.fn();

    await act(async () => {
      expect(
        await holdWithUndo({
          kind: "HUB_REMIND",
          targetId: "p1",
          payload: { userIds: ["u1"] },
          message: "Reminded 1 person",
          invalidate,
        }),
      ).toBe(true);
    });

    expect(holdActionAction).toHaveBeenCalledWith({ kind: "HUB_REMIND", targetId: "p1", payload: { userIds: ["u1"] } });
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Reminded 1 person")).toBeInTheDocument();
  });

  it("leaves the payload out when the direct endpoint takes no body", async () => {
    render(<Toaster />);
    await act(() => approve());
    expect(holdActionAction).toHaveBeenCalledWith({ kind: "TIME_OFF_APPROVE", targetId: "r1" });
  });

  it("lasts exactly the server's window, and the toast goes at its end", async () => {
    jest.mocked(holdActionAction).mockResolvedValue(held(300));
    render(<Toaster />);

    await act(() => approve());
    await screen.findByText("Time off approved");

    await waitFor(() => expect(screen.queryByText("Time off approved")).not.toBeInTheDocument(), { timeout: 2000 });
    // Running out is the server's business: nothing is applied or cancelled from here.
    expect(applyHeldActionAction).not.toHaveBeenCalled();
    expect(cancelHeldActionAction).not.toHaveBeenCalled();
  });

  it("re-reads the lists once the server has applied it", async () => {
    jest.mocked(holdActionAction).mockResolvedValue(held(100));
    render(<Toaster />);
    const invalidate = jest.fn();

    await act(() => approve(invalidate));
    expect(invalidate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2), { timeout: APPLIED_SETTLE_MS + 1500 });
  });

  it("Undo cancels it on the server and re-reads the lists", async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    const invalidate = jest.fn();

    await act(() => approve(invalidate));
    await user.click(await undoButton());

    await waitFor(() => expect(cancelHeldActionAction).toHaveBeenCalledWith("h1"));
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
    expect(applyHeldActionAction).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Time off approved")).not.toBeInTheDocument());
  });

  it("says it was already applied when the Undo came too late (409)", async () => {
    jest.mocked(cancelHeldActionAction).mockResolvedValue({
      status: ActionStatus.ERROR,
      code: HELD_ACTION_ALREADY_APPLIED,
      errorMessage: messageForCode(HELD_ACTION_ALREADY_APPLIED),
    });
    const user = userEvent.setup();
    render(<Toaster />);

    await act(() => approve());
    await user.click(await undoButton());

    expect(await screen.findByText("Already applied")).toBeInTheDocument();
  });

  it("closing the toast applies it now", async () => {
    render(<Toaster />);
    await act(() => approve());
    await screen.findByText("Time off approved");

    act(() => {
      toast.dismiss();
    });

    await waitFor(() => expect(applyHeldActionAction).toHaveBeenCalledWith("h1"));
    expect(cancelHeldActionAction).not.toHaveBeenCalled();
  });

  it("shows a refusal at once, as the direct call would, and offers no Undo", async () => {
    jest.mocked(holdActionAction).mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "E00409",
      errorMessage: messageForCode("E00409"),
    });
    render(<Toaster />);
    const invalidate = jest.fn();

    let result = true;
    await act(async () => {
      result = await approve(invalidate);
    });

    expect(result).toBe(false);
    expect(await screen.findByText(/Somebody else changed this/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /undo/i })).not.toBeInTheDocument();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("reads a call that could not be made at all as a refusal", async () => {
    jest.mocked(holdActionAction).mockRejectedValue(new Error("network"));
    render(<Toaster />);

    let result = true;
    await act(async () => {
      result = await approve();
    });

    expect(result).toBe(false);
    expect(screen.queryByRole("button", { name: /undo/i })).not.toBeInTheDocument();
  });
});
