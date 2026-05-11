import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";
import {
  usePublicHolidayTemplates
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayTemplates/usePublicHolidayTemplates";
import { getPublicHolidayTemplatesQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService",
  () => ({
    publicHolidayTemplatesService: {
      list: jest.fn(),
    },
  })
);

describe("usePublicHolidayTemplates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with templates query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() => usePublicHolidayTemplates());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplatesQueryKey(),
      queryFn: expect.any(Function),
    });

    await capturedOpts.queryFn();

    expect(publicHolidayTemplatesService.list).toHaveBeenCalledWith();
  });
});
