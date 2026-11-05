/**
 * The ratchet (technical_design/I18N_DESIGN.md § 7.1): words written into a component instead of a catalogue
 * may only go down.
 *
 * `baseline.json` holds, per file, how many literal texts it had when extraction started. A file may not
 * exceed its count, and a file not listed may have none — so every new screen is written with `t()` from the
 * first day, while old modules move one at a time. When a file's count drops, tighten the baseline with
 * `npm run i18n:baseline`; the test says so but does not fail, so extraction never blocks on bookkeeping.
 *
 * An exemption is a comment `i18n-exempt: <reason>` on the line or the line above (`scan.js`).
 */
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BASELINE, ROOT, countLiterals, scanFile } = require("./scan.js") as {
  BASELINE: string;
  ROOT: string;
  countLiterals: () => Record<string, number>;
  scanFile: (absolute: string) => { line: number; text: string }[];
};

const baseline: Record<string, number> = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const current = countLiterals();

describe("literal texts in components (the i18n ratchet)", () => {
  it("no file has more literal texts than its baseline, and no new file has any", () => {
    const grown = Object.entries(current)
      .filter(([file, count]) => count > (baseline[file] ?? 0))
      .map(([file, count]) => {
        const sample = scanFile(`${ROOT}/${file}`)
          .slice(0, 3)
          .map((hit) => `    line ${hit.line}: "${hit.text}"`)
          .join("\n");
        return `${file}: ${count} (baseline ${baseline[file] ?? 0})\n${sample}`;
      });

    if (grown.length > 0) {
      throw new Error(
        "Words written into components instead of messages/<locale>/*.json — use t() (I18N_DESIGN.md § 2):\n" +
          grown.join("\n"),
      );
    }
  });

  it("reports where the baseline can be tightened", () => {
    const shrunk = Object.entries(baseline).filter(([file, count]) => (current[file] ?? 0) < count);
    if (shrunk.length > 0) {
      console.info(`i18n: ${shrunk.length} files have fewer literal texts than their baseline — run npm run i18n:baseline`);
    }
    expect(shrunk.length).toBeGreaterThanOrEqual(0);
  });
});
