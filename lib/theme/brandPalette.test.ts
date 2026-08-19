import { hexToOklch, oklchToHex, parseHex } from "@/lib/theme/oklch";
import { BRAND_STEPS, buildBrandPalette, buildBrandStyleSheet } from "@/lib/theme/brandPalette";

const BROWN_LIGHTNESS: Record<number, number> = {
  50: 0.964,
  100: 0.945,
  200: 0.884,
  300: 0.817,
  400: 0.701,
  500: 0.579,
  600: 0.499,
  700: 0.42,
  800: 0.349,
  900: 0.297,
};

describe("oklch", () => {
  it("parses shorthand and full hex, rejects junk", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("2563eb")).toEqual([37, 99, 235]);
    expect(parseHex("#12345")).toBeNull();
    expect(parseHex("rebeccapurple")).toBeNull();
  });

  it("round-trips a colour through oklch within one 8-bit step", () => {
    for (const hex of ["#2563eb", "#947068", "#16a34a", "#ffffff", "#000000"]) {
      const oklch = hexToOklch(hex);
      expect(oklch).not.toBeNull();

      const [r, g, b] = parseHex(oklchToHex(oklch!))!;
      const [sr, sg, sb] = parseHex(hex)!;

      expect(Math.abs(r - sr)).toBeLessThanOrEqual(1);
      expect(Math.abs(g - sg)).toBeLessThanOrEqual(1);
      expect(Math.abs(b - sb)).toBeLessThanOrEqual(1);
    }
  });

  it("keeps an out-of-gamut colour in sRGB by dropping chroma, not hue", () => {
    // Chroma far beyond what sRGB can show at this lightness.
    const clamped = hexToOklch(oklchToHex({ l: 0.5, c: 0.4, h: 150 }))!;

    expect(clamped.c).toBeLessThan(0.4);
    expect(Math.abs(clamped.h - 150)).toBeLessThan(2);
  });
});

describe("buildBrandPalette", () => {
  it("preserves the brown lightness ramp for any brand colour", () => {
    for (const brand of ["#2563eb", "#16a34a", "#e11d48"]) {
      const palette = buildBrandPalette(brand)!;

      for (const step of BRAND_STEPS) {
        const { l } = hexToOklch(palette.scale[step])!;
        expect(Math.abs(l - BROWN_LIGHTNESS[step])).toBeLessThan(0.01);
      }
    }
  });

  it("carries the brand hue through every step", () => {
    const brandHue = hexToOklch("#2563eb")!.h;
    const palette = buildBrandPalette("#2563eb")!;

    for (const step of BRAND_STEPS) {
      expect(Math.abs(hexToOklch(palette.scale[step])!.h - brandHue)).toBeLessThan(2);
    }
  });

  it("keeps surface steps near-grey even for a neon brand", () => {
    const palette = buildBrandPalette("#ff00ff")!;

    // 50-300 are backgrounds and borders: they must not become vivid.
    for (const step of [50, 100, 200, 300] as const) {
      expect(hexToOklch(palette.scale[step])!.c).toBeLessThanOrEqual(0.05);
    }

    // 600 is the primary button: it must actually read as the brand.
    expect(hexToOklch(palette.scale[600])!.c).toBeGreaterThan(0.15);
  });

  it("lets a muted brand stay muted", () => {
    const muted = buildBrandPalette("#947068")!;
    const vivid = buildBrandPalette("#2563eb")!;

    expect(hexToOklch(muted.scale[600])!.c).toBeLessThan(hexToOklch(vivid.scale[600])!.c);
  });

  it("re-hues neutrals without touching their lightness", () => {
    const palette = buildBrandPalette("#2563eb")!;
    const source = hexToOklch("#2c2420")!;
    const branded = hexToOklch(palette.neutrals["--color-text-primary"])!;

    expect(Math.abs(branded.l - source.l)).toBeLessThan(0.01);
    expect(Math.abs(branded.c - source.c)).toBeLessThan(0.005);
    expect(Math.abs(branded.h - hexToOklch("#2563eb")!.h)).toBeLessThan(2);
  });

  it("returns null for an unparseable colour", () => {
    expect(buildBrandPalette("not-a-colour")).toBeNull();
  });
});

describe("buildBrandStyleSheet", () => {
  it("is empty when no brand colour is set, so the shipped brown stands", () => {
    expect(buildBrandStyleSheet(null)).toBe("");
    expect(buildBrandStyleSheet(undefined)).toBe("");
    expect(buildBrandStyleSheet("")).toBe("");
    expect(buildBrandStyleSheet("#nope")).toBe("");
  });

  it("scopes neutrals away from dark mode but not the brand scale", () => {
    const sheet = buildBrandStyleSheet("#2563eb");

    expect(sheet).toContain("html:root{--brown-50:");
    expect(sheet).toContain("html:root:not(.dark){--color-text-primary:");
  });
});
