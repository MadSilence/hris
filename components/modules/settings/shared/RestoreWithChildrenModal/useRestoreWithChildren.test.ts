import { act, renderHook, waitFor } from "@testing-library/react";

import { useRestoreWithChildren } from "./useRestoreWithChildren";
import type { RestoreChild } from "./restoreSelection";
import { showError } from "@/lib/errors/errorToast";

jest.mock("@/lib/errors/errorToast", () => ({ showError: jest.fn() }));

type HookProps = Parameters<typeof useRestoreWithChildren>[0];

const child: RestoreChild = {
  id: "inbound",
  name: "Inbound",
  parentId: "sales",
  depth: 1,
  archivedAt: "2026-10-01T10:00:00",
  archivedWithParent: true,
};

const answered = (items: RestoreChild[] | undefined, isError = false): HookProps["impact"] => ({
  items,
  isFetching: false,
  isError,
  error: isError ? new Error("boom") : null,
});

const setup = (initial: Partial<HookProps>) => {
  const restore = jest.fn<Promise<unknown>, [string, string[] | undefined]>().mockResolvedValue(undefined);
  const onFinished = jest.fn();
  const props: HookProps = {
    targetId: "sales",
    impact: { items: undefined, isFetching: true, isError: false, error: null },
    restore,
    onFinished,
    ...initial,
  };
  const hook = renderHook((p: HookProps) => useRestoreWithChildren(p), { initialProps: props });
  return { ...hook, props, restore, onFinished };
};

describe("useRestoreWithChildren", () => {
  beforeEach(() => jest.clearAllMocks());

  it("waits for the answer before doing anything", () => {
    const { result, restore } = setup({});

    expect(result.current.isDialogOpen).toBe(false);
    expect(restore).not.toHaveBeenCalled();
  });

  it("restores at once, with no dialog, when nothing is archived underneath", async () => {
    const { result, rerender, props, restore, onFinished } = setup({});

    rerender({ ...props, impact: answered([]) });

    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
    expect(restore).toHaveBeenCalledTimes(1);
    expect(restore).toHaveBeenCalledWith("sales", undefined);
    expect(result.current.isDialogOpen).toBe(false);
  });

  it("puts an immediate refusal in the sliding card, since there is no dialog to hold it", async () => {
    const { rerender, props, restore, onFinished } = setup({});
    const refusal = new Error("Refused");
    restore.mockRejectedValueOnce(refusal);

    rerender({ ...props, impact: answered([]) });

    await waitFor(() => expect(onFinished).toHaveBeenCalled());
    expect(showError).toHaveBeenCalledWith(refusal);
  });

  it("opens the choice when something was archived underneath, and restores only on confirm", async () => {
    const { result, rerender, props, restore, onFinished } = setup({});

    rerender({ ...props, impact: answered([child]) });

    await waitFor(() => expect(result.current.isDialogOpen).toBe(true));
    expect(result.current.items).toEqual([child]);
    expect(restore).not.toHaveBeenCalled();

    await act(() => result.current.confirm(["inbound"]));

    expect(restore).toHaveBeenCalledWith("sales", ["inbound"]);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("keeps the dialog open with the refusal written inside it", async () => {
    const { result, rerender, props, restore, onFinished } = setup({});
    rerender({ ...props, impact: answered([child]) });
    await waitFor(() => expect(result.current.isDialogOpen).toBe(true));
    restore.mockRejectedValueOnce(new Error("A sub-department can only come back with its parent."));

    await act(() => result.current.confirm(["inbound"]));

    expect(result.current.errorMessage).toBe("A sub-department can only come back with its parent.");
    expect(result.current.isDialogOpen).toBe(true);
    expect(onFinished).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it("does not restore when the question itself failed", async () => {
    const { rerender, props, restore, onFinished } = setup({});

    rerender({ ...props, impact: answered(undefined, true) });

    await waitFor(() => expect(onFinished).toHaveBeenCalled());
    expect(showError).toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });
});
