import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CompanyDataProvider, { useCompanyData } from "./CompanyDataProvider";

function TestConsumer() {
  const { company, companyId, isLoading } = useCompanyData();

  if (isLoading) return <div>Loading</div>;

  return (
    <div>
      <div data-test="company-id">{companyId}</div>
      <div data-test="company-name">{company?.name}</div>
    </div>
  );
}

describe("CompanyDataProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "company-id",
        name: "My Company",
        subdomain: "my-company",
        companyLogo: null,
      }),
    }) as jest.Mock;
  });

  it("loads company data and exposes it through context", async () => {
    render(
      <CompanyDataProvider>
        <TestConsumer/>
      </CompanyDataProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("company-id")).toHaveTextContent("company-id");
    });

    expect(screen.getByTestId("company-name")).toHaveTextContent("My Company");
    expect(global.fetch).toHaveBeenCalledWith("/api/company", {
      credentials: "include",
    });
  });
});
