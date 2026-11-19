import { showsFacesToday } from "./ThisWeekWidget";

jest.mock("@/components/modules/home/hooks", () => ({ useCelebrations: jest.fn() }));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({ useCompanyData: jest.fn() }));

describe("This week: today's people by name or as faces (board LW06)", () => {
  it("names up to two in Small and Medium, then faces and the count", () => {
    expect(showsFacesToday("S", 2)).toBe(false);
    expect(showsFacesToday("S", 3)).toBe(true);
    expect(showsFacesToday("M", 2)).toBe(false);
    expect(showsFacesToday("M", 3)).toBe(true);
  });

  it("names up to three in Large", () => {
    expect(showsFacesToday("L", 3)).toBe(false);
    expect(showsFacesToday("L", 4)).toBe(true);
  });
});
