import { AttributeType } from "@/models/attribute/AttributeType";
import { isMaskedValue, objectValueSummary } from "@/models/attribute/objectValueSummary";
import type { useTranslations } from "next-intl";
import { translatorFor } from "@/test/nextIntl";

const t = translatorFor("common") as unknown as ReturnType<typeof useTranslations<"common">>;

describe("objectValueSummary", () => {
  it("reads money as an amount in its currency", () => {
    const out = objectValueSummary(t, AttributeType.MONEY, [{ amount: "48000", currency: "EUR" }]);
    expect(out).toContain("48");
    expect(out).not.toContain("{");
  });

  it("keeps an unknown currency code rather than losing the value", () => {
    expect(objectValueSummary(t, AttributeType.MONEY, [{ amount: "10", currency: "ZZZ" }])).toContain("10");
  });

  it("joins the non-empty parts of an address", () => {
    const out = objectValueSummary(t, AttributeType.ADDRESS, [
      { line1: "1 Main St", line2: "", city: "Berlin", country: "DE" },
    ]);
    expect(out).toBe("1 Main St, Berlin, DE");
  });

  it("counts a repeatable object with several records", () => {
    expect(objectValueSummary(t, AttributeType.OBJECT, [{ a: 1 }, { a: 2 }])).toBe("2 entries");
  });

  it("shows the one record of an object", () => {
    const schema = JSON.stringify([{ key: "school", label: "School", type: "TEXT" }]);
    expect(objectValueSummary(t, AttributeType.OBJECT, [{ school: "MIT" }], schema)).toBe("MIT");
  });

  it("is empty for no value", () => {
    expect(objectValueSummary(t, AttributeType.ADDRESS, null)).toBe("");
  });
});

describe("isMaskedValue", () => {
  it("recognises the bare mask and the mask with a tail", () => {
    expect(isMaskedValue("••••")).toBe(true);
    expect(isMaskedValue("•••• 1234")).toBe(true);
    expect(isMaskedValue("secret")).toBe(false);
  });
});
