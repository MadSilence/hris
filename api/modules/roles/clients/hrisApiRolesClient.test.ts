import { hrisApiRolesClient } from "@/api/modules/roles/clients/hrisApiRolesClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    patch: jest.fn(),
    put: jest.fn(),
  },
}));

describe("HrisApiRolesClient — the version the edit forms send back", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(hrisApiClient.patch).mockResolvedValue({ id: "r1" });
    jest.mocked(hrisApiClient.put).mockResolvedValue({ accessToken: "t" });
  });

  it("updateRoleName sends the renamed fields with the version", async () => {
    await hrisApiRolesClient.updateRoleName("r1", { newName: "Team lead", description: "Leads", version: 2 });

    expect(jest.mocked(hrisApiClient.patch).mock.calls[0]).toStrictEqual([
      "/roles/r1",
      { name: "Team lead", description: "Leads", version: 2 },
    ]);
  });

  it("updateRoleName still leaves out what the form did not offer", async () => {
    await hrisApiRolesClient.updateRoleName("r1", { newName: "Team lead" });

    expect(jest.mocked(hrisApiClient.patch).mock.calls[0]).toStrictEqual(["/roles/r1", { name: "Team lead" }]);
  });

  it("updateRolePermissions forwards the body with its version untouched", async () => {
    const body = { permissions: [], version: 9 };

    await hrisApiRolesClient.updateRolePermissions("r1", body);

    expect(jest.mocked(hrisApiClient.put).mock.calls[0]).toStrictEqual(["/roles/r1/permissions", body]);
  });
});
