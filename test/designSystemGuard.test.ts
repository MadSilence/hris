import fs from "fs";
import path from "path";

/*
 * The design system's fence (`(claude)/development_plan/REDESIGN_PLAN.md` 11.1).
 *
 * `styles/globals.css` switches Tailwind's defaults off, so an old class produces no CSS — and nothing else
 * would say so: the element just loses its colour, its radius, its size. This test is what says so. It reads
 * every source file and fails on anything outside the noddo design system: a class from the old palette or
 * scale, a raw HEX in a component, an icon from another set, the old product name.
 *
 * A rule that has a legitimate exception names the files it allows, with the reason beside them.
 */

const ROOT = path.resolve(__dirname, "..");
const SCANNED = ["app", "components", "lib", "models", "config", "api", "server", "test"];
const THIS_FILE = path.relative(ROOT, __filename).split(path.sep).join("/");

const sources = (): { file: string; text: string }[] => {
  const out: { file: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(tsx?|css)$/.test(entry.name)) {
        const file = path.relative(ROOT, full).split(path.sep).join("/");
        if (file !== THIS_FILE) out.push({ file, text: withoutComments(fs.readFileSync(full, "utf8")) });
      }
    }
  };
  for (const dir of SCANNED) {
    if (fs.existsSync(path.join(ROOT, dir))) walk(path.join(ROOT, dir));
  }
  return out;
};

/*
 * Comments are prose — "rounded corners", "uppercase labels" — and are blanked before matching. Line breaks
 * are kept so the reported line numbers stay right. A `//` right after a colon is a URL, not a comment.
 */
const withoutComments = (text: string) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/(?<![:"'])\/\/[^\n]*/g, (comment) => " ".repeat(comment.length));

type Rule = {
  name: string;
  pattern: RegExp;
  /** Files where the pattern is legitimate, each with its reason in a comment. */
  allow?: RegExp[];
};

// A class position: start of a string or a space, after any variants (`hover:`, `data-[state=open]:`, `!`).
const CLASS = String.raw`(?<=["'\`\s{(]|^)(?:[\w\-\[\]=&>*@.:/()!]*:)?!?`;

const OLD_PALETTE =
  "brown|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|success|danger|warning|info";

const COLOR_UTILITIES = "bg|text|border(?:-[trblxy])?|ring|ring-offset|divide|outline|fill|stroke|from|via|to|decoration|caret|accent|shadow|placeholder";

const RULES: Rule[] = [
  {
    name: "a colour from the old palette (brown, Tailwind's named colours, the old status scales)",
    pattern: new RegExp(`${CLASS}(?:${COLOR_UTILITIES})-(?:${OLD_PALETTE})-\\d{2,3}(?:/\\d+)?(?![\\w-])`, "g"),
  },
  {
    name: "white or black instead of a surface or text role",
    pattern: new RegExp(`${CLASS}(?:${COLOR_UTILITIES})-(?:white|black)(?:/\\d+)?(?![\\w-])`, "g"),
  },
  {
    name: "a shadcn colour name (the system's roles are primary, tertiary, card, accent, danger…)",
    pattern: new RegExp(
      `${CLASS}(?:bg|text|border(?:-[trblxy])?|ring|divide|outline|fill|stroke|decoration|placeholder)-(?:foreground|background|muted|muted-foreground|primary-foreground|secondary-foreground|accent-foreground|destructive|destructive-foreground|popover|popover-foreground|card-foreground|input|input-background|ring|sidebar-foreground|sidebar-accent|sidebar-primary)(?:/\\d+)?(?![\\w-])`,
      "g",
    ),
  },
  {
    name: "a Tailwind type size instead of a role (text-body, text-label, text-hint, text-section-title…)",
    pattern: new RegExp(`${CLASS}text-(?:xs|sm|base|md|lg|xl|[2-9]xl|\\[\\d+(?:\\.\\d+)?(?:px|rem|em)\\])(?![\\w-])`, "g"),
  },
  {
    name: "a weight or style the system forbids (700+, light, italics, all caps, tracking)",
    pattern: new RegExp(
      `${CLASS}(?:font-(?:thin|extralight|light|bold|extrabold|black)|italic|uppercase|tracking-(?:tighter|tight|wide|wider|widest|normal))(?![\\w-])`,
      "g",
    ),
  },
  {
    name: "a Tailwind radius instead of a role (rounded-tag, -control, -popover, -card, -panel, -pill)",
    pattern: new RegExp(`${CLASS}rounded(?:-[trblse]{1,2})?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|full|\\[[^\\]]+\\]))?(?![\\w-])`, "g"),
    // The 4 px corner of the row checkbox (SPEC § 8's one exception) is `rounded-glyph`, a token.
  },
  {
    name: "a Tailwind shadow instead of a level (shadow-card, -raised, -popover, -dialog, -drag)",
    pattern: new RegExp(`${CLASS}shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner|\\[[^\\]]+\\]))?(?![\\w:-])`, "g"),
  },
  {
    name: "a spinner, a pulse or the old animation plugin (loaders are one nodding ring; skeletons shimmer)",
    pattern: new RegExp(
      `${CLASS}(?:animate-(?:spin|pulse|ping|bounce|in|out|accordion-up|accordion-down)|(?:fade|zoom|slide)-(?:in|out)(?:-[\\w-]+)?)(?![\\w-])`,
      "g",
    ),
  },
  {
    name: "a raw HEX colour in a component (components read role tokens)",
    pattern: /(?<![\w&])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g,
    allow: [
      // The noddo logo is the one thing that hard-codes Wine and Rose (SPEC § 4.4).
      /^components\/brand\//,
      // The accent derivation works on HEX values by definition, and its tests feed it some.
      /^lib\/theme\/accent(\.test)?\.ts$/,
      // A company's custom colour is typed and validated as a HEX, and read on the server as one.
      /^components\/modules\/settings\/modules\/general\/companyAppearance\//,
      /^components\/providers\/WorkspaceAccent\//,
      // The design system's own token files.
      /^styles\//,
      // The product's icons and manifest draw the noddo mark, which is Wine and Rose by definition.
      /^app\/(manifest|apple-icon)\.tsx?$/,
    ],
  },
  {
    name: "a CSS variable of the old theme (--brown-*, --color-text-*, the shadcn names)",
    pattern: /var\(--(?:brown-\d+|color-(?:text|bg|border|fg)-[\w-]+|muted|accent-foreground|primary-foreground|theme-primary|sidebar-(?:badge|item)-[\w-]+|danger-\d+|success-\d+|warning-\d+|info-\d+)\)/g,
  },
  {
    name: "an icon from another set (Hugeicons only, SPEC § 9)",
    pattern: /from ["'](?:lucide-react|@radix-ui\/react-icons|react-icons[\w/-]*|@heroicons\/[\w/-]+)["']|from ["']@\/public\/icons\//g,
  },
  {
    name: "the old product name",
    pattern: /SixSoftware|Six Software|sixsoftware/g,
  },
  {
    name: "a hand-painted status panel (an inline message is InlineAlert, a page's state is Banner — SPEC § 13.7)",
    pattern: /rounded-(?:control|tag|card) border border-status-(?:declined|pending|approved|info)-border/g,
    // The two surfaces themselves.
    allow: [/^components\/desact\/alert\.tsx$/],
  },
  {
    name: "a hand-made error line (a field's error is FieldError, a form's refusal is FormError — SPEC § 12)",
    pattern: /<p\b[^>]*\btext-danger-text\b/g,
    allow: [/^components\/desact\/field-error\.tsx$/],
  },
  {
    name: "a button's height set by a class (the size prop is the height: sm 32, md 36, lg 44)",
    pattern: /<Button\b[^>]*className="[^"]*\bh-(?:8|9|10|11|12)\b/g,
  },
  {
    name: "three dots in a string (an ellipsis is one character, and waiting is a nodding ring — SPEC § 12)",
    pattern: /["'`>][^"'`<>\n]*[A-Za-z]\.\.\.["'`<]/g,
  },
];

describe("the noddo design system", () => {
  const files = sources();

  it.each(RULES.map((rule) => [rule.name, rule] as const))("has no %s", (_name, rule) => {
    const found: string[] = [];
    for (const { file, text } of files) {
      if (rule.allow?.some((allowed) => allowed.test(file))) continue;
      for (const match of text.matchAll(rule.pattern)) {
        const line = text.slice(0, match.index).split("\n").length;
        found.push(`${file}:${line}  ${match[0].trim()}`);
      }
    }
    if (found.length > 0) {
      throw new Error(`${found.length} found:\n${found.slice(0, 400).join("\n")}${found.length > 400 ? "\n…" : ""}`);
    }
  });
});
