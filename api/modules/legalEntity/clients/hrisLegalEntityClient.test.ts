import { hrisLegalEntityClient } from "@/api/modules/legalEntity/clients/hrisLegalEntityClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    patch: jest.fn(),
  },
}));

describe("HrisLegalEntityClient.updateLegalEntity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The body is built field by field, so a field the form sends is dropped unless it is named here.
  // The version is the one that matters: without it the backend cannot refuse a stale save.
  it("sends the version the form was opened with", async () => {
    jest.mocked(hrisApiClient.patch).mockResolvedValue({ id: "le-1" });

    await hrisLegalEntityClient.updateLegalEntity({
      id: "le-1",
      name: "Acme GmbH",
      description: "",
      registrationNumber: "HRB 1",
      taxId: "DE1",
      country: "Germany",
      city: "Berlin",
      street: "Teststrasse",
      building: "5",
      postCode: "10117",
      version: 7,
    });

    expect(hrisApiClient.patch).toHaveBeenCalledWith("/legal-entities/le-1", {
      name: "Acme GmbH",
      description: "",
      registrationNumber: "HRB 1",
      taxId: "DE1",
      country: "Germany",
      city: "Berlin",
      street: "Teststrasse",
      building: "5",
      postCode: "10117",
      version: 7,
    });
  });
});
