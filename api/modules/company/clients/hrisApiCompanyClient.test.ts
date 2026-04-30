import { hrisApiCompanyClient } from "@/api/modules/company/clients/hrisApiCompanyClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
  },
}));

describe("HrisApiCompanyClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = "http://localhost:8080";
  });

  it("gets company from backend and maps dto", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue({
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: "/uploads/logo.png",
    });

    const result = await hrisApiCompanyClient.getCompany();

    expect(hrisApiClient.get).toHaveBeenCalledWith("/company");
    expect(result).toEqual({
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: "http://localhost:8080/uploads/logo.png",
    });
  });
});
