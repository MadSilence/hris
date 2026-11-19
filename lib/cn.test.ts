import fs from "fs";
import path from "path";
import { cn } from "./cn";

/*
 * `cn` merges classes with tailwind-merge, which knows a type size from a colour only by the names `lib/cn.ts` lists.
 * A size declared in `styles/globals.css` and missing there is dropped beside a colour, with no error anywhere: Home's
 * Light greeting rendered at 14 px for that reason (the designers' fixes L1 and widgets H1, 2026-11-18 → 11-19). This
 * reads every size the stylesheet declares and proves each one survives a colour after it.
 */
const sizes = (): string[] => {
  const css = fs.readFileSync(path.resolve(__dirname, "../styles/globals.css"), "utf8");
  const names = new Set<string>();
  for (const match of css.matchAll(/^\s*--text-([a-z0-9-]+):/gm)) {
    const name = match[1];
    // `--text-x--line-height` and friends are a size's parts; `--text-primary`-like roles are colours, not here.
    if (!name.includes("--")) names.add(name);
  }
  return [...names];
};

describe("cn keeps every type size beside a colour", () => {
  const all = sizes();

  it("reads the sizes from the stylesheet", () => {
    expect(all).toEqual(expect.arrayContaining(["body", "home-greeting", "widget-title"]));
  });

  it.each(all)("text-%s", (name) => {
    expect(cn(`text-${name}`, "text-primary")).toBe(`text-${name} text-primary`);
  });
});
