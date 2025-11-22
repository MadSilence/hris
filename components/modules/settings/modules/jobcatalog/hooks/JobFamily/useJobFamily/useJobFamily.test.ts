import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { JOB_FAMILY_QUERY_KEY, useJobFamily } from "./useJobFamily";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: jest.fn(),
}));

describe("useJobFamily", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with correct queryKey and queryFn", () => {
    const mockClient = { get: jest.fn() };
    (useAppDataContext as jest.Mock).mockReturnValue({
      internalApiClient: mockClient,
    });

    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });

    renderHook(() => useJobFamily());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [JOB_FAMILY_QUERY_KEY],
      queryFn: expect.any(Function),
    });
  });
});
