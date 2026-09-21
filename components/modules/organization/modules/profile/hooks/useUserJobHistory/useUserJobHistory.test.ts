import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { USER_JOB_HISTORY_QUERY_KEY, useUserJobHistory } from "./useUserJobHistory";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { CapturedReactQueryOptions } from "@/test/types";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: jest.fn(),
}));

type QueryOptions = CapturedReactQueryOptions & { enabled?: boolean };

const lastOptions = (): QueryOptions =>
  (useQuery as jest.Mock).mock.calls.at(-1)[0] as QueryOptions;

describe("useUserJobHistory", () => {
  const get = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDataContext as jest.Mock).mockReturnValue({ internalApiClient: { get } });
    (useQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
  });

  it("reads the person's timeline through the BFF route", async () => {
    get.mockResolvedValue([]);

    renderHook(() => useUserJobHistory("user-1", { enabled: true, currentJobId: "job-1" }));

    await lastOptions().queryFn();
    expect(get).toHaveBeenCalledWith("/users/user-1/job-history");
  });

  it("keys the query on the position the profile shows, so a change refetches it", () => {
    renderHook(() => useUserJobHistory("user-1", { enabled: true, currentJobId: "job-1" }));
    expect(lastOptions().queryKey).toEqual([USER_JOB_HISTORY_QUERY_KEY, "user-1", "job-1"]);

    renderHook(() => useUserJobHistory("user-1", { enabled: true }));
    expect(lastOptions().queryKey).toEqual([USER_JOB_HISTORY_QUERY_KEY, "user-1", null]);
  });

  it("does not ask when the reader may not see the position", () => {
    renderHook(() => useUserJobHistory("user-1", { enabled: false }));
    expect(lastOptions().enabled).toBe(false);
  });
});
