import { renderHook, act } from "@testing-library/react";
import { flushWrites, scheduleWrite, usePendingWrites } from "./deferredWrites";

describe("Home's held writes", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("sends a write when the undo window closes", () => {
    const send = jest.fn().mockResolvedValue(undefined);
    scheduleWrite("k1", send);
    jest.advanceTimersByTime(4999);
    expect(send).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("drops a write on Undo — nothing reaches the server", () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const undo = scheduleWrite("k2", send);
    expect(undo()).toBe(true);
    jest.advanceTimersByTime(10_000);
    expect(send).not.toHaveBeenCalled();
    expect(undo()).toBe(false);
  });

  it("sends at once when Home is left", () => {
    const send = jest.fn().mockResolvedValue(undefined);
    scheduleWrite("k3", send);
    flushWrites();
    expect(send).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(10_000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("keeps the card hidden while the write is in flight, and lets it go when the answer arrives (walk of 2026-11-11)", async () => {
    let answer: () => void = () => undefined;
    const send = jest.fn(() => new Promise<void>((resolve) => { answer = resolve; }));
    const { result } = renderHook(() => usePendingWrites());
    let undo: () => boolean = () => false;
    act(() => { undo = scheduleWrite("k4", send); });
    act(() => { jest.advanceTimersByTime(5000); });
    expect(send).toHaveBeenCalledTimes(1);
    expect(result.current.has("k4")).toBe(true);
    expect(undo()).toBe(false);
    await act(async () => { answer(); await Promise.resolve(); });
    expect(result.current.has("k4")).toBe(false);
  });
});
