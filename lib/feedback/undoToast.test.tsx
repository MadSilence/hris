import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { showUndoToast, UNDO_WINDOW_MS } from "./undoToast";

const showError = jest.fn();
jest.mock("@/lib/errors/errorToast", () => ({
  showError: (error: unknown) => showError(error),
}));

const renderToaster = () => render(<Toaster />);

describe("showUndoToast", () => {
  beforeEach(() => {
    showError.mockClear();
  });

  it("says what happened and offers to undo it", async () => {
    renderToaster();
    showUndoToast({ message: "Annual Leave archived", onUndo: jest.fn() });

    expect(await screen.findByText("Annual Leave archived")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("runs the undo when it is pressed", async () => {
    const user = userEvent.setup();
    const onUndo = jest.fn();

    renderToaster();
    showUndoToast({ message: "Annual Leave archived", onUndo });

    await user.click(await screen.findByRole("button", { name: /undo/i }));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("takes the card away as it runs, so the undo cannot be pressed twice", async () => {
    const user = userEvent.setup();

    renderToaster();
    showUndoToast({ message: "Annual Leave archived", onUndo: jest.fn() });

    await user.click(await screen.findByRole("button", { name: /undo/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /undo/i })).not.toBeInTheDocument(),
    );
  });

  it("surfaces a failed undo as an ordinary error rather than swallowing it", async () => {
    const user = userEvent.setup();
    const boom = new Error("nope");

    renderToaster();
    showUndoToast({
      message: "Annual Leave archived",
      onUndo: () => Promise.reject(boom),
    });

    await user.click(await screen.findByRole("button", { name: /undo/i }));

    await waitFor(() => expect(showError).toHaveBeenCalledWith(boom));
  });

  it("is the designers' card: one text action, no close button, no bar", async () => {
    renderToaster();
    showUndoToast({ message: "Annual Leave archived", onUndo: jest.fn() });

    await screen.findByText("Annual Leave archived");

    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Undo"]);
    expect(document.body.querySelector('[style*="undo-drain"]')).toBeNull();
    // Five seconds, as every toast (SPEC § 13.7).
    expect(UNDO_WINDOW_MS).toBe(5000);
  });
});
