import { hrisAttributeClient } from "@/api/modules/attributes/clients/hrisAttributeClient";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    patch: jest.fn(),
    put: jest.fn(),
  },
}));

describe("HrisAttributeClient — the version the edit form sends back", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updateAttribute puts the version in the body and keeps the id in the path only", async () => {
    jest.mocked(hrisApiClient.patch).mockResolvedValue({ id: "a1", version: 6 });

    const result = await hrisAttributeClient.updateAttribute({ id: "a1", name: "Shoe size", version: 5 });

    expect(jest.mocked(hrisApiClient.patch).mock.calls[0]).toStrictEqual([
      "/attributes/a1",
      { name: "Shoe size", version: 5 },
    ]);
    // The option save that follows needs the version this update left the attribute at.
    expect(result).toEqual({ id: "a1", version: 6 });
  });

  it("setAttributeOptions sends the options with the attribute's version", async () => {
    jest.mocked(hrisApiClient.put).mockResolvedValue(undefined);

    await hrisAttributeClient.setAttributeOptions("a1", [{ id: "o1", value: "S", color: "#AABBCC" }], 6);

    expect(jest.mocked(hrisApiClient.put).mock.calls[0]).toStrictEqual([
      "/attributes/a1/options",
      { options: [{ id: "o1", value: "S", color: "#AABBCC" }], version: 6 },
    ]);
  });
});
