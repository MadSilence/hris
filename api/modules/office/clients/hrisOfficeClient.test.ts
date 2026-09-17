import { hrisOfficeClient } from "@/api/modules/office/clients/hrisOfficeClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    patch: jest.fn(),
  },
}));

describe("HrisOfficeClient.updateOffice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The body is built field by field, so a field the form sends is dropped unless it is named here.
  // The version is the one that matters: without it the backend cannot refuse a stale save.
  it("sends the version the form was opened with", async () => {
    jest.mocked(hrisApiClient.patch).mockResolvedValue({ id: "office-1" });

    await hrisOfficeClient.updateOffice({
      id: "office-1",
      name: "Berlin",
      description: "",
      email: "",
      phone: "",
      country: "Germany",
      city: "Berlin",
      street: "Teststrasse",
      building: "5",
      postCode: "10117",
      version: 3,
    });

    expect(hrisApiClient.patch).toHaveBeenCalledWith("/offices/office-1", {
      name: "Berlin",
      description: "",
      email: "",
      phone: "",
      country: "Germany",
      city: "Berlin",
      street: "Teststrasse",
      building: "5",
      postCode: "10117",
      version: 3,
    });
  });
});
