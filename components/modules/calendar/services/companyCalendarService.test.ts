import { internalApiClient } from "@/components/clients/apiClient";
import type { FilterDTO } from "@/models/user/fields";
import { companyCalendarService } from "@/components/modules/calendar/services/companyCalendarService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { post: jest.fn() },
}));

const STATUS_FILTER = [{ field: "sys:status", op: "eq", value: "ACTIVE" }] as FilterDTO[];

describe("companyCalendarService", () => {
  it("sends a flat request as before, with the group fields empty", async () => {
    await companyCalendarService.people({ q: "an" });
    expect(internalApiClient.post).toHaveBeenCalledWith("/calendar/company/people", {
      cursor: null,
      limit: null,
      q: "an",
      filters: null,
      groupBy: null,
      groupId: null,
    });
  });

  it("asks for one group's rows, the no-value group as a null id", async () => {
    await companyCalendarService.people({ cursor: "c", limit: 25, group: { by: "OFFICE", id: null } });
    expect(internalApiClient.post).toHaveBeenCalledWith("/calendar/company/people", {
      cursor: "c",
      limit: 25,
      q: null,
      filters: null,
      groupBy: "OFFICE",
      groupId: null,
    });
  });

  it("asks for the group headers with the search and the filters", async () => {
    await companyCalendarService.groups({ q: "an", filters: STATUS_FILTER, groupBy: "DEPARTMENT" });
    expect(internalApiClient.post).toHaveBeenCalledWith("/calendar/company/groups", {
      q: "an",
      filters: STATUS_FILTER,
      groupBy: "DEPARTMENT",
    });
  });
});
