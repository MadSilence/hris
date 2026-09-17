import { hrisGroupsClient } from "@/api/modules/groups/clients/hrisGroupsClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    put: jest.fn(),
  },
}));

describe("HrisGroupsClient.renameAttributeGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends name, description and the version the form was opened with — and nothing else", async () => {
    jest.mocked(hrisApiClient.put).mockResolvedValue({ id: "g1" });

    await hrisGroupsClient.renameAttributeGroup({
      id: "g1",
      name: "Uniform",
      description: "Sizes",
      version: 4,
    });

    // Exact body: the backend refuses a property its request does not declare, so `id` stays out.
    expect(jest.mocked(hrisApiClient.put).mock.calls[0]).toStrictEqual([
      "/groups/g1/rename",
      { name: "Uniform", description: "Sizes", version: 4 },
    ]);
  });
});
