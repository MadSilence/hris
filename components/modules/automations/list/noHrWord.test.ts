import fs from "fs";
import path from "path";

/**
 * The product never says "HR" (DECISIONS.md § "The leftovers of the design rounds", WALK_QUESTIONS § 43) — the
 * automations' words included. A role a company names "HR lead" is its data, not a word of ours.
 */
describe("the automations' catalogues", () => {
  const dir = path.resolve(__dirname, "../../../../messages");
  const files = ["en", "ru"].flatMap((lang) =>
    fs.readdirSync(path.join(dir, lang)).filter((f) => f.startsWith("automations")).map((f) => path.join(lang, f)),
  );

  it.each(files)("%s does not say HR", (file) => {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    expect(text.match(/\bHR\b|[Оо]тдел кадров/g) ?? []).toEqual([]);
  });
});
