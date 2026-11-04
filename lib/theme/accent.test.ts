import fs from "fs";
import path from "path";

import {
  ACCENT_PRESETS,
  accentAttributes,
  applyAccent,
  contrast,
  deriveAccentInputs,
  mix,
  resolveAccent,
  type AccentPreset,
} from "@/lib/theme/accent";

/*
 * The custom-colour derivation must agree with the package's own numbers. tokens.css precomputes the
 * contrast-dependent inputs of the ten presets with the package's accent.js; deriving them here from the
 * preset's HEX has to land on the same values, or a company with a custom colour would get a different
 * product from one with a preset.
 */
const TOKENS = fs.readFileSync(path.join(__dirname, "../../styles/noddo/tokens.css"), "utf8");

const presetInputs = (preset: AccentPreset): Record<string, string> => {
  const block = TOKENS.match(new RegExp(`\\[data-accent="${preset}"\\] \\{([^}]*)\\}`));
  if (!block) throw new Error(`no block for ${preset}`);
  return Object.fromEntries([...block[1].matchAll(/(--[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
};

describe("the workspace accent", () => {
  it.each(Object.keys(ACCENT_PRESETS) as AccentPreset[])("derives what tokens.css carries for %s", (preset) => {
    expect(deriveAccentInputs(ACCENT_PRESETS[preset]).properties).toEqual(presetInputs(preset));
  });

  it("mixes like color-mix in sRGB (the package's Wine hover and subtle tint)", () => {
    expect(mix("#6E1630", "#000000", 0.12)).toBe("#61132A");
    expect(mix("#FFFFFF", "#6E1630", 0.06)).toBe("#F6F1F3");
  });

  it("darkens the links of a light custom colour until they read at 4.5:1, and says so", () => {
    const { properties, adjusted } = deriveAccentInputs("#B5E61D");
    expect(adjusted).toBe(true);
    expect(contrast(properties["--accent-text-light"], "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(properties["--accent-on-light"]).toBe("#0B0B0C");
  });

  it("reads a stored preset, a custom HEX and nothing at all", () => {
    expect(resolveAccent("denim")).toEqual({ kind: "preset", preset: "denim" });
    expect(resolveAccent("#2f63c4")).toEqual({ kind: "custom", hex: "#2F63C4" });
    expect(resolveAccent(null)).toEqual({ kind: "preset", preset: "wine" });
    expect(resolveAccent("purple")).toEqual({ kind: "preset", preset: "wine" });
  });

  it("puts a preset on data-accent and a custom colour into the inputs", () => {
    expect(accentAttributes("forest")).toEqual({ "data-accent": "forest" });
    expect(accentAttributes("#123456").style?.["--accent-base"]).toBe("#123456");
  });

  it("repaints an element without leaving the other kind's attributes behind", () => {
    const element = document.createElement("html");
    applyAccent(element, "#123456");
    expect(element.getAttribute("data-accent")).toBeNull();
    expect(element.style.getPropertyValue("--accent-base")).toBe("#123456");

    applyAccent(element, "iris");
    expect(element.getAttribute("data-accent")).toBe("iris");
    expect(element.style.getPropertyValue("--accent-base")).toBe("");
  });
});
