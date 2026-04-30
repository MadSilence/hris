import { hrisApiCompanyService } from "@/api/modules/company/services/hrisCompanyService";
import { hrisApiCompanyClient } from "@/api/modules/company/clients/hrisApiCompanyClient";

jest.mock("@/api/modules/company/clients/hrisApiCompanyClient", () => ({
  hrisApiCompanyClient: {
    getCompany: jest.fn(),
  },
}));

describe("HrisApiCompanyService", () => {
  it("delegates getCompany to client", async () => {
    const company = {
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: null,
    };

    jest.mocked(hrisApiCompanyClient.getCompany).mockResolvedValue(company);

    await expect(hrisApiCompanyService.getCompany()).resolves.toBe(company);
    expect(hrisApiCompanyClient.getCompany).toHaveBeenCalled();
  });
});
