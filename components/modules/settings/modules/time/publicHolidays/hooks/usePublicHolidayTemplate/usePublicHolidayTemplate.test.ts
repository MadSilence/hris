import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";
import {
  usePublicHolidayTemplate
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayTemplate/usePublicHolidayTemplate";
import { getPublicHolidayTemplateQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService",
  () => ({
    publicHolidayTemplatesService: {
      getById: jest.fn(),
    },
  })
);

describe("usePublicHolidayTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with template query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() =>
      usePublicHolidayTemplate({
        templateId: "template-id",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplateQueryKey("template-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(publicHolidayTemplatesService.getById).toHaveBeenCalledWith(
      "template-id"
    );
  });

  it("disables query when templateId is empty", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayTemplate({
        templateId: "",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplateQueryKey(""),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });

  it("disables query when templateId is undefined string", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayTemplate({
        templateId: "undefined",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplateQueryKey("undefined"),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });
});
