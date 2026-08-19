/**
 * Minimal sRGB <-> OKLCH conversion.
 *
 * OKLCH is used (rather than HSL) because its L axis is perceptually uniform: holding L fixed while
 * changing hue keeps the apparent contrast of a colour, which is what lets the brand generator swap
 * the hue of the whole palette without re-checking the contrast of 1200+ usages.
 *
 * Hand-rolled on purpose — the repo does not take new dependencies for this.
 */

export type Oklch = {
  /** Perceptual lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma (saturation), 0 (grey) to ~0.37 for the most vivid sRGB colours. */
  c: number;
  /** Hue angle in degrees, 0-360. Meaningless when c is 0. */
  h: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const srgbToLinear = (channel: number) => {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (channel: number) => {
  const v = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  return clamp(Math.round(v * 255), 0, 255);
};

/** Accepts `#rgb` and `#rrggbb`, with or without the leading hash. Returns null when unparseable. */
export const parseHex = (value: string): [number, number, number] | null => {
  const raw = value.trim().replace(/^#/, "");

  const full = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

export const isValidHex = (value: string): boolean => parseHex(value) !== null;

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

export const hexToOklch = (hex: string): Oklch | null => {
  const rgb = parseHex(hex);
  if (!rgb) return null;

  const [r, g, b] = rgb.map(srgbToLinear);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: lightness,
    c: Math.hypot(a, bb),
    h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
  };
};

/** Linear-light RGB for an OKLCH triple. Channels outside 0..1 mean the colour is out of sRGB gamut. */
const oklchToLinearRgb = ({ l, c, h }: Oklch): [number, number, number] => {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(l - 0.0894841775 * a - 1.291485548 * b, 3);

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
};

const inGamut = ([r, g, b]: [number, number, number]) => {
  const tolerance = 0.0001;
  return [r, g, b].every((channel) => channel >= -tolerance && channel <= 1 + tolerance);
};

/**
 * Hex for an OKLCH triple, reducing chroma until the colour fits in sRGB. Clipping channels instead
 * would shift the hue; dropping chroma keeps hue and lightness, which is what the ramp depends on.
 */
export const oklchToHex = (color: Oklch): string => {
  let chroma = Math.max(0, color.c);

  if (!inGamut(oklchToLinearRgb({ ...color, c: chroma }))) {
    let low = 0;
    let high = chroma;

    // 20 halvings resolve chroma far below one 8-bit step.
    for (let i = 0; i < 20; i += 1) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) {
        low = mid;
      } else {
        high = mid;
      }
    }

    chroma = low;
  }

  const [r, g, b] = oklchToLinearRgb({ ...color, c: chroma });

  return toHex(linearToSrgb(r), linearToSrgb(g), linearToSrgb(b));
};
