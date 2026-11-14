import {
  accentKey,
  accentToSave,
  autoLight,
  customOf,
  hexToHsv,
  hsvToHex,
  parseColorCode,
  sameAccent,
  startingBackground,
} from "@/components/modules/settings/modules/general/companyAppearance/appearanceDraft";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";

const appearance = (overrides: Partial<CompanyAppearance> = {}): CompanyAppearance => ({
  accent: null,
  background: "COLOR",
  backgroundChosen: false,
  logoColors: [],
  version: 0,
  ...overrides,
});

describe("the Appearance draft", () => {
  it("takes a colour code with or without its #, and nothing else", () => {
    expect(parseColorCode("#2F63C4")).toBe("#2f63c4");
    expect(parseColorCode(" 2f63c4 ")).toBe("#2f63c4");
    expect(parseColorCode("#abc")).toBeNull();
    expect(parseColorCode("purple")).toBeNull();
  });

  it("reads nothing and Wine as one choice, and saves Wine as nothing", () => {
    expect(sameAccent(null, "wine")).toBe(true);
    expect(sameAccent("#2F63C4", "#2f63c4")).toBe(true);
    expect(sameAccent("basil", "#2e7d32")).toBe(false);
    expect(accentToSave("wine")).toBeNull();
    expect(accentToSave("Basil")).toBe("basil");
    expect(accentKey("#ABCDEF")).toBe("#abcdef");
  });

  it("tells a custom colour from a preset", () => {
    expect(customOf("#4a2c63")).toBe("#4a2c63");
    expect(customOf("ocean")).toBeNull();
    expect(customOf(null)).toBeNull();
  });

  it("offers Light for a logo of several colours while the company never chose a background", () => {
    expect(autoLight(appearance({ logoColors: ["#be123c", "#f5c518"] }))).toBe(true);
    expect(startingBackground(appearance({ logoColors: ["#be123c", "#f5c518"] }))).toBe("LIGHT");
    expect(autoLight(appearance({ logoColors: ["#be123c"] }))).toBe(false);
    expect(autoLight(appearance({ logoColors: ["#be123c", "#f5c518"], backgroundChosen: true }))).toBe(false);
    expect(startingBackground(appearance({ backgroundChosen: true, background: "LIGHT" }))).toBe("LIGHT");
  });

  it("goes round HSV and back", () => {
    ["#6e1630", "#f5c518", "#0369a1", "#000000", "#ffffff"].forEach((hex) => expect(hsvToHex(hexToHsv(hex))).toBe(hex));
  });
});
