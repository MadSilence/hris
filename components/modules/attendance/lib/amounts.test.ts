import { formatAmounts } from "@/components/modules/attendance/lib/amounts";

describe("formatAmounts", () => {
  it("formats one amount in its own currency", () => {
    expect(formatAmounts([{ currency: "EUR", amount: 1234.5 }], "en-US")).toBe("€1,234.50");
  });

  it("joins several currencies with a plus, in the order the server sent them, never converted", () => {
    expect(formatAmounts([
      { currency: "EUR", amount: 240 },
      { currency: "USD", amount: 80 },
    ], "en-US")).toBe("€240.00 + $80.00");
  });

  it("shows nothing — not zero — when the reader may not see the money", () => {
    expect(formatAmounts(null, "en-US")).toBeNull();
    expect(formatAmounts(undefined, "en-US")).toBeNull();
  });

  it("shows nothing when nothing in the period carries a rate", () => {
    expect(formatAmounts([], "en-US")).toBeNull();
  });

  it("still prints a currency code Intl does not know", () => {
    expect(formatAmounts([{ currency: "XX1", amount: 5 }], "en-US")).toBe("5.00 XX1");
  });
});
