import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";
import {
  usePublicHolidayTemplatePreview
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayTemplatePreview/usePublicHolidayTemplatePreview";
import {
  getPublicHolidayTemplatePreviewQueryKey
} from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService",
  () => ({
    publicHolidayTemplatesService: {
      preview: jest.fn(),
    },
  })
);

describe("usePublicHolidayTemplatePreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with preview query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() =>
      usePublicHolidayTemplatePreview({
        templateId: "template-id",
        year: 2026,
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplatePreviewQueryKey("template-id", 2026),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(publicHolidayTemplatesService.preview).toHaveBeenCalledWith(
      "template-id",
      2026
    );
  });

  it("uses 0 in query key and disables query when year is null", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayTemplatePreview({
        templateId: "template-id",
        year: null,
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplatePreviewQueryKey("template-id", 0),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });

  it("disables query when templateId is empty", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayTemplatePreview({
        templateId: "",
        year: 2026,
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplatePreviewQueryKey("", 2026),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });

  it("disables query when templateId is undefined string", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayTemplatePreview({
        templateId: "undefined",
        year: 2026,
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayTemplatePreviewQueryKey("undefined", 2026),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });
});
