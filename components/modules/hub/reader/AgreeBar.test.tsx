import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { AgreeBar, AGREED_LINE_MS } from "./AgreeBar";

jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("AgreeBar", () => {
  it("asks for the version by its date and says who will see it", () => {
    render(<AgreeBar versionNo={3} dueOn="2026-11-20" overdue={false} ownerFirstName="Anna" onAgree={jest.fn()} />);
    expect(screen.getByText(/^Agree to version 3 by /)).toBeInTheDocument();
    expect(screen.getByText("Anna will see that you agreed and when")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I agree" })).toBeEnabled();
  });

  it("says when an overdue page was due", () => {
    render(<AgreeBar versionNo={2} dueOn="2026-11-01" overdue ownerFirstName="Anna" onAgree={jest.fn()} />);
    expect(screen.getByText(/^Agree to version 2 — it was due /)).toBeInTheDocument();
  });

  it("agrees once, shows the quiet line, then leaves", async () => {
    jest.useFakeTimers();
    const answer = deferred<{ versionNo: number; agreedAt: string }>();
    const onAgree = jest.fn(() => answer.promise);
    render(<AgreeBar versionNo={3} dueOn="2026-11-20" overdue={false} ownerFirstName="Anna" onAgree={onAgree} />);

    fireEvent.click(screen.getByRole("button", { name: /I agree/ }));
    fireEvent.click(screen.getByRole("button", { name: /I agree|Agreeing/ }));
    expect(onAgree).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Agreeing…/ })).toHaveAttribute("aria-busy", "true");

    await act(async () => answer.resolve({ versionNo: 3, agreedAt: "2026-11-12T10:00:00Z" }));
    expect(screen.getByRole("status")).toHaveTextContent(/^You agreed to version 3 on /);

    act(() => jest.advanceTimersByTime(AGREED_LINE_MS));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it("keeps the bar and offers Retry when agreeing fails", async () => {
    const onAgree = jest.fn(() => Promise.reject(new Error("down")));
    render(<AgreeBar versionNo={3} dueOn="2026-11-20" overdue={false} ownerFirstName="Anna" onAgree={onAgree} />);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: /I agree/ })));

    expect(toast.error).toHaveBeenCalledWith("Couldn't save your answer. Try again.", expect.objectContaining({ action: expect.objectContaining({ label: "Retry" }) }));
    expect(screen.getByRole("button", { name: /I agree/ })).toBeEnabled();
  });
});
