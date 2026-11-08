#!/usr/bin/env node
/*
 * Regenerates `scenes.tsx` from the package's ring illustrations in `styles/noddo/assets/illustrations/*.svg`.
 *
 *   node components/illustrations/generate.mjs        (or: npm run illustrations)
 *
 * The SVGs are the designers' final drawings and are copied into the package folder as they come — never edited.
 * This script only translates them to JSX: attributes to camelCase, `style` to an object, the `var(--x, #hex)`
 * fallbacks dropped (the tokens are always loaded in the app), a hard white knock-out turned into
 * `--illustration-knockout`, and the root's stroke defaults (width, caps, joins) written onto each top-level
 * element, since the root <svg> is `Illustration.tsx`'s, not the file's. Metadata, titles and the provenance
 * manifests stay in the files.
 *
 * Sub-folders are not scenes. `404/` is the 404 page's own drawing — the one illustration that moves — and is
 * written to `notFoundScenes.tsx`, the moving cut and the still one, for `NotFoundDrawing.tsx`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "../../styles/noddo/assets/illustrations");
const TARGET = join(HERE, "scenes.tsx");
const NOT_FOUND_TARGET = join(HERE, "notFoundScenes.tsx");

/*
 * Labels for files that do not carry an `aria-label` of their own — the scenes added on 2026-11-06
 * (`design/screens/empty-state-illustrations/spec.md`, "Scene labels"). The six redrawn scenes keep the label
 * they had; the `-s` cuts, which the spec gives no label, say what their full scene says.
 */
const LABELS = {
  "coming-soon": "Coming soon: a sprout in a pot, its bud is the ring",
  archive: "Archive: a box with its lid lifted, an accent ring inside",
  trash: "Trash: a bin with its lid slightly open, the knob is the ring",
  history: "History: a timeline, the newest entry is the ring",
  career: "Career: steps going up, a ring person on the top step",
  templates: "Templates: a stack of layout cards, a ring marks where to start",
  office: "Office: a map pin, its hole is the ring",
  tasks: "Tasks: a to-do list, the first item checked in the accent",
  people: "People: a ring person in front of two colleagues",
  "review-cycle": "Review cycle: people on a turning loop, one is the ring",
  nomination: "Nomination: a ring person and an arrow toward two empty seats",
  welcome: "Welcome: a rocket ready to launch, the porthole is the ring",
  "no-match": "No match: a filter funnel with the ring inside, items left outside",
  "legal-entity": "Legal entity: a building with columns and a round emblem",
  "job-families": "Job families: a ring branching into three role cards",
  notifications: "Notifications: a bell, its clapper is the ring",
  automations: "Automations: a lightning bolt with a ring and speed lines",
  "all-caught-up": "All caught up: a tray holding the accent ring with an accent check",
  policies: "Policies: a shield with an accent ring inside",
  "goals-and-growth": "Goals: a target with an arrow hitting the accent ring in the center",
  announcements: "Announcements: a megaphone with an accent notification ring",
  signing: "Signing: a page with a signature line and a pen",
  surveys: "Surveys: a speech bubble with three rating rings, one in the accent colour",
  "attendance-s": "Attendance, simplified for S size: a clock",
  "career-s": "Career, simplified for S size: steps going up to a ring",
  "forms-s": "Forms, simplified for S size: a clipboard with one checked box",
  "history-s": "History, simplified for S size: a timeline starting at the ring",
  "no-match-s": "No match, simplified for S size: a filter funnel with the ring inside",
  "people-s": "People, simplified for S size: a ring person between two colleagues",
  "reviews-and-one-on-ones-s": "Reviews, simplified for S size: two people facing each other, one is the ring",
};

const ROOT_DEFAULTS = ["stroke-width", "stroke-linecap", "stroke-linejoin"];

const camel = (name) => (name.startsWith("data-") || name.startsWith("aria-") ? name : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
const dropFallback = (value) => value.replace(/var\((--[\w-]+)\s*,\s*#[0-9A-Fa-f]+\)/g, "var($1)");

/* A bare colour in a style is the on-Wine recipe (SPEC § 10): it becomes the token it is, never a raw HEX. */
const TOKENS = { "#FFFFFF": "var(--white)", "#9E2F4F": "var(--wine-500)" };
function styleColour(value) {
  if (!/^#[0-9A-Fa-f]+$/.test(value)) return value;
  const token = TOKENS[value.toUpperCase()];
  if (!token) throw new Error(`a raw colour ${value} with no token — add it to TOKENS`);
  return token;
}

function parseAttrs(source) {
  const attrs = [];
  for (const m of source.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs.push([m[1], m[2]]);
  return attrs;
}

function jsxAttrs(attrs) {
  return attrs
    .map(([name, value]) => {
      if (name === "style") {
        const entries = value
          .split(";")
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => {
            const i = d.indexOf(":");
            return `${camel(d.slice(0, i).trim())}: "${styleColour(dropFallback(d.slice(i + 1).trim()))}"`;
          });
        return `style={{ ${entries.join(", ")} }}`;
      }
      if ((name === "stroke" || name === "fill") && /^#fff(fff)?$/i.test(value)) value = "var(--illustration-knockout)";
      return `${camel(name)}="${dropFallback(value)}"`;
    })
    .join(" ");
}

function convert(file, dir = SOURCE) {
  const svg = readFileSync(join(dir, file), "utf8")
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const root = svg.match(/<svg\b([^>]*)>/);
  if (!root) throw new Error(`${file}: no <svg>`);
  const rootAttrs = new Map(parseAttrs(root[1]));
  if (rootAttrs.get("viewBox") !== "0 0 240 150") throw new Error(`${file}: the canvas must be 240×150`);
  const body = svg.slice(root.index + root[0].length, svg.lastIndexOf("</svg>"));

  const lines = [];
  let depth = 0;
  for (const m of body.matchAll(/<(\/?)([\w:-]+)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, rawAttrs, selfClosing] = m;
    if (closing) {
      depth -= 1;
      lines.push(`      </${tag}>`);
      continue;
    }
    const attrs = parseAttrs(rawAttrs);
    if (depth === 0) {
      for (const name of ROOT_DEFAULTS) {
        if (rootAttrs.has(name) && !attrs.some(([n]) => n === name)) attrs.push([name, rootAttrs.get(name)]);
      }
    }
    lines.push(`      <${tag}${attrs.length ? " " + jsxAttrs(attrs) : ""}${selfClosing ? "/" : ""}>`);
    if (!selfClosing) depth += 1;
  }
  if (depth !== 0) throw new Error(`${file}: unbalanced tags`);
  if (!/currentColor/.test(body)) throw new Error(`${file}: no ring in currentColor`);

  const scene = file.replace(/\.svg$/, "");
  const label = LABELS[scene] ?? rootAttrs.get("aria-label");
  if (!label) throw new Error(`${file}: no label — add one to LABELS`);
  return { scene, jsx: lines.join("\n"), label };
}

const files = readdirSync(SOURCE, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".svg"))
  .map((e) => e.name)
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const scenes = files.map((file) => convert(file));

const out = `/*
 * The ${scenes.length} ring illustrations of the noddo design system (SPEC § 10), generated from the package's
 * \`assets/illustrations/*.svg\` by \`generate.mjs\` beside this file — regenerate rather than edit by hand. The
 * provenance manifests the files carry are left out of the bundle; the package keeps them.
 *
 * One object in Ink, exactly one ring in the accent (\`currentColor\`), gray support lines, one baseline; every
 * colour is a CSS variable, so the same scene works on any accent and in the dark theme. \`onboarding-on-wine\` is
 * the one drawn for a Wine or Ink background.
 */
import * as React from "react";

export const SCENES = {
${scenes.map((s) => `  "${s.scene}": (\n    <>\n${s.jsx}\n    </>\n  ),`).join("\n")}
} satisfies Record<string, React.ReactElement>;

export type Scene = keyof typeof SCENES;

/** What each scene shows, read by assistive technology when the scene is not decorative. */
export const SCENE_LABELS: Record<Scene, string> = {
${scenes.map((s) => `  "${s.scene}": ${JSON.stringify(s.label)}`).join(",\n")}
};
`;

writeFileSync(TARGET, out);
console.log(`scenes.tsx: ${scenes.length} scenes`);

const notFoundDir = join(SOURCE, "404");
const LABELS_404 = { "404-balls-animated": "Five balls fall, bounce once and roll apart", "404-balls-static": "Five balls resting in a row" };
Object.assign(LABELS, LABELS_404);
const moving = convert("404-balls-animated.svg", notFoundDir);
const still = convert("404-balls-static.svg", notFoundDir);
writeFileSync(
  NOT_FOUND_TARGET,
  `/*
 * The 404 page's drawing (empty-state spec, "404 page"), generated from the package's
 * \`assets/illustrations/404/*.svg\` by \`generate.mjs\` — regenerate rather than edit by hand.
 *
 * MOVING plays once (SMIL, 3.6 s, \`fill="freeze"\`): five balls fall from one point, bounce, roll apart and stay.
 * STILL is the same picture at rest, for reduced motion. Lines are 5 px, the page's own.
 */
import * as React from "react";

export const NOT_FOUND_MOVING = (
  <>
${moving.jsx}
  </>
);

export const NOT_FOUND_STILL = (
  <>
${still.jsx}
  </>
);
`,
);
console.log("notFoundScenes.tsx: written");
