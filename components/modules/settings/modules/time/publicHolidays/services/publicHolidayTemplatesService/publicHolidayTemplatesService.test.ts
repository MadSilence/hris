import { internalApiClient } from "@/components/clients/apiClient";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService/publicHolidayTemplatesService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;
const mockPost = internalApiClient.post as jest.Mock;

describe("PublicHolidayTemplatesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday templates", async () => {
    const response = [{ id: "template-id" }];
    mockGet.mockResolvedValue(response);

    const result = await publicHolidayTemplatesService.list();

    expect(mockGet).toHaveBeenCalledWith("/public-holiday/templates");
    expect(result).toEqual(response);
  });

  it("gets public holiday template by id", async () => {
    const response = { id: "template-id" };
    mockGet.mockResolvedValue(response);

    const result = await publicHolidayTemplatesService.getById("template-id");

    expect(mockGet).toHaveBeenCalledWith("/public-holiday/templates/template-id");
    expect(result).toEqual(response);
  });

  it("previews public holiday template", async () => {
    const response = { templateId: "template-id", year: 2026, holidays: [] };
    mockPost.mockResolvedValue(response);

    const result = await publicHolidayTemplatesService.preview("template-id", 2026);

    expect(mockPost).toHaveBeenCalledWith(
      "/public-holiday/templates/template-id/preview",
      { year: 2026 },
    );
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(publicHolidayTemplatesService.list()).rejects.toThrow("boom");
  });
});
