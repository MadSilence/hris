import fs from "fs";
import path from "path";

import {
  ACCENT_GRID,
  ACCENT_PRESETS,
  PACKAGE_PRESETS,
  accentAttributes,
  applyAccent,
  contrast,
  deriveAccentInputs,
  hueDistance,
  hueOf,
  isCloseToApproved,
  isRedAccent,
  mix,
  resolveAccent,
  type AccentPreset,
} from "@/lib/theme/accent";

/*
 * The custom-colour derivation must agree with the package's own numbers. tokens.css precomputes the
 * contrast-dependent inputs of the presets it carries with the package's accent.js; deriving them here from the
 * preset's HEX has to land on the same values, or a company with a custom colour would get a different
 * product from one with a preset.
 */
const TOKENS = fs.readFileSync(path.join(__dirname, "../../styles/noddo/tokens.css"), "utf8");

const presetInputs = (preset: AccentPreset): Record<string, string> | null => {
  const block = TOKENS.match(new RegExp(`\\[data-accent="${preset}"\\] \\{([^}]*)\\}`));
  if (!block) return null;
  return Object.fromEntries([...block[1].matchAll(/(--[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
};

describe("the workspace accent", () => {
  it("knows which presets the designers' package carries", () => {
    const carried = (Object.keys(ACCENT_PRESETS) as AccentPreset[]).filter((preset) => presetInputs(preset) !== null);
    expect(carried.sort()).toEqual([...PACKAGE_PRESETS].sort());
  });

  it.each([...PACKAGE_PRESETS])("derives what tokens.css carries for %s", (preset) => {
    expect(deriveAccentInputs(ACCENT_PRESETS[preset]).properties).toEqual(presetInputs(preset));
  });

  it("puts the nine on the grid in the designers' order, Graphite off it", () => {
    expect(ACCENT_GRID).toEqual(["wine", "cherry", "tangerine", "sunflower", "basil", "indigo", "ocean", "mulberry", "black"]);
  });

  it("writes Graphite on Sunflower and white on every other preset, by contrast", () => {
    ACCENT_GRID.forEach((preset) => {
      const onLight = deriveAccentInputs(ACCENT_PRESETS[preset]).properties["--accent-on-light"];
      expect([preset, onLight]).toEqual([preset, preset === "sunflower" ? "#2A2A2E" : "#FFFFFF"]);
      expect(contrast(onLight, ACCENT_PRESETS[preset])).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("mixes like color-mix in sRGB (the package's Wine hover and subtle tint)", () => {
    expect(mix("#6E1630", "#000000", 0.12)).toBe("#61132A");
    expect(mix("#FFFFFF", "#6E1630", 0.06)).toBe("#F6F1F3");
  });

  it("darkens the links of a light custom colour until they read at 4.5:1, and says so", () => {
    const { properties, adjusted } = deriveAccentInputs("#B5E61D");
    expect(adjusted).toBe(true);
    expect(contrast(properties["--accent-text-light"], "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(properties["--accent-on-light"]).toBe("#2A2A2E");
  });

  it("reads a stored preset, a custom HEX and nothing at all", () => {
    expect(resolveAccent("ocean")).toEqual({ kind: "preset", preset: "ocean" });
    expect(resolveAccent("#2f63c4")).toEqual({ kind: "custom", hex: "#2F63C4" });
    expect(resolveAccent(null)).toEqual({ kind: "preset", preset: "wine" });
    expect(resolveAccent("purple")).toEqual({ kind: "preset", preset: "wine" });
    expect(resolveAccent("denim")).toEqual({ kind: "preset", preset: "wine" });
  });

  it("puts a preset on data-accent, with the derived inputs while the package lacks it, and a custom colour into the inputs", () => {
    expect(accentAttributes("wine")).toEqual({ "data-accent": "wine" });
    const basil = accentAttributes("basil");
    expect(basil["data-accent"]).toBe("basil");
    expect(basil.style?.["--accent-base"]).toBe("#2E7D32");
    expect(accentAttributes("#123456").style?.["--accent-base"]).toBe("#123456");
  });

  it("repaints an element without leaving the other kind's attributes behind", () => {
    const element = document.createElement("html");
    applyAccent(element, "#123456");
    expect(element.getAttribute("data-accent")).toBeNull();
    expect(element.style.getPropertyValue("--accent-base")).toBe("#123456");

    applyAccent(element, "cherry");
    expect(element.getAttribute("data-accent")).toBe("cherry");
    expect(element.getAttribute("data-accent-tone")).toBe("red");

    applyAccent(element, "wine");
    expect(element.getAttribute("data-accent")).toBe("wine");
    expect(element.getAttribute("data-accent-tone")).toBeNull();
    expect(element.style.getPropertyValue("--accent-base")).toBe("");
  });
});

describe("a company colour close to a status colour", () => {
  it("measures hue the short way round", () => {
    expect(Math.round(hueOf("#C42B1C") ?? -1)).toBe(5);
    expect(hueOf("#808080")).toBeNull();
    expect(hueDistance(350, 10)).toBe(20);
  });

  it("calls Cherry, Tangerine and a close custom red a red workspace, and nothing else on the grid", () => {
    expect(ACCENT_GRID.filter((preset) => isRedAccent(preset))).toEqual(["cherry", "tangerine"]);
    expect(isRedAccent("#d0302a")).toBe(true);
    expect(isRedAccent("#2e7d32")).toBe(false);
  });

  it("finds none of the nine close to Approved, and a custom green that is", () => {
    expect(ACCENT_GRID.filter((preset) => isCloseToApproved(preset))).toEqual([]);
    expect(isCloseToApproved("#047857")).toBe(true);
  });
});
