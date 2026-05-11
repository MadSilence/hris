import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService/publicHolidayTemplatesService";

describe("PublicHolidayTemplatesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("lists public holiday templates", async () => {
    const response = [{ id: "template-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidayTemplatesService.list();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-templates",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    expect(result).toEqual(response);
  });

  it("throws error when list fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      publicHolidayTemplatesService.list()
    ).rejects.toThrow("Failed to load public holiday templates");
  });

  it("gets public holiday template by id", async () => {
    const response = { id: "template-id" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidayTemplatesService.getById(
      "template-id"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-templates/template-id",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    expect(result).toEqual(response);
  });

  it("throws error when getById fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      publicHolidayTemplatesService.getById("template-id")
    ).rejects.toThrow("Failed to load public holiday template");
  });

  it("previews public holiday template", async () => {
    const response = {
      templateId: "template-id",
      year: 2026,
      holidays: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidayTemplatesService.preview(
      "template-id",
      2026
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-templates/template-id/preview",
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year: 2026 }),
      }
    );

    expect(result).toEqual(response);
  });

  it("throws error when preview fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      publicHolidayTemplatesService.preview("template-id", 2026)
    ).rejects.toThrow("Failed to preview public holiday template");
  });
});
