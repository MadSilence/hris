import { AttributeType } from "@/models/attribute/AttributeType";
import { catalogLabel } from "@/models/attribute/managedCatalogs";

// WALK_QUESTIONS § 27 (b): a country is stored as its English name and read in the reader's language.
describe("catalogLabel", () => {
  it("names a stored country in the reader's language", () => {
    expect(catalogLabel(AttributeType.COUNTRY, "Germany", "ru")).toBe("Германия");
    expect(catalogLabel(AttributeType.COUNTRY, "Germany", "en")).toBe("Germany");
  });

  it("names a stored language in the reader's language", () => {
    expect(catalogLabel(AttributeType.LANGUAGE, "German", "ru")).toBe("немецкий");
  });

  it("shows a value that is no country as it was typed", () => {
    expect(catalogLabel(AttributeType.COUNTRY, "Atlantis", "ru")).toBe("Atlantis");
  });

  it("leaves other types alone", () => {
    expect(catalogLabel(AttributeType.TEXT, "Germany", "ru")).toBe("Germany");
  });
});
