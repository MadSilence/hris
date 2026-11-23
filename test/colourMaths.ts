/*
 * Colour maths for the palette tests (`tagPalette.test.ts`, `leavePalette.test.ts`): WCAG contrast, and the distance
 * between two colours in OKLab (× 100) as seen with normal vision or under a simulated colour-vision deficiency
 * (Machado, Oliveira & Fernandes 2009, severity 1).
 */
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};

export const SIMULATIONS: Record<string, number[][] | null> = {
  none: null,
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};

/** OKLab of the colour as seen under a simulation, from linear sRGB. */
function seen(hex: string, m: number[][] | null): number[] {
  let [r, g, b] = rgb(hex).map(lin);
  if (m) [r, g, b] = m.map((row) => Math.min(1, Math.max(0, row[0] * r + row[1] * g + row[2] * b)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s,
  ];
}

export const distance = (a: string, b: string, m: number[][] | null) =>
  100 * Math.hypot(...seen(a, m).map((v, i) => v - seen(b, m)[i]));
