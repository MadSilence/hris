/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Finds the words still written into components rather than read from a catalogue
 * (technical_documentation/I18N.md § 7.1). Shared by the ratchet test (`i18nLiterals.test.ts`) and the
 * script that rewrites its baseline (`npm run i18n:baseline`).
 *
 * Read through the TypeScript AST, so a class name, an import path or an enum value is not mistaken for a
 * sentence. What counts as user-facing text:
 *   - JSX text (`<p>Save changes</p>`);
 *   - a string given to a text attribute (`label`, `placeholder`, `title`, `aria-label`, `alt` …);
 *   - a string under a text key of an object (`{ label: "Mon" }`);
 *   - a string chosen inside a JSX expression (`{done ? "Done" : "Open"}`) or a template literal with words.
 * A string is text only when it has words: two letters in a row, a lowercase letter, and not the shape of a
 * code, a key, a path, a URL or a list of utility classes.
 *
 * An exemption is a comment `i18n-exempt: <reason>` on the line or the line above — for a brand name, a
 * sample value, a format token.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..", "..");
const SCANNED = ["app", "components", "lib", "models"];

const TEXT_ATTRIBUTES = new Set([
  "label", "placeholder", "title", "description", "aria-label", "alt", "tooltip", "emptyText", "emptyMessage",
  "helperText", "hint", "subtitle", "heading", "confirmLabel", "cancelLabel", "text", "message", "caption",
  "header", "legend", "ariaLabel", "emptyState", "emptyTitle", "emptyDescription", "submitLabel", "actionLabel",
  "buttonLabel", "line", "body", "headline", "subheadline", "lead", "summary", "placeholderText", "noun",
]);

const looksLikeText = (raw) => {
  const s = raw.replace(/\s+/g, " ").trim();
  return (
    /[A-Za-z]{2,}/.test(s) &&
    /[a-z]/.test(s) &&
    !/^[a-z0-9_.:/#?=&-]+$/.test(s) && // a key, a path, a slug
    !/^[A-Z0-9_]+$/.test(s) && // an enum value
    !/^(https?:|mailto:|\/|#|\.|@|data:)/.test(s) &&
    !/^[a-z][a-zA-Z0-9]*$/.test(s) && // an identifier
    !/(^|\s)(flex|grid|block|inline|hidden|px-|py-|p-|m[trblxy]?-|text-|bg-|w-|h-|min-|max-|rounded|border|gap-|items-|justify-|shadow|overflow|absolute|relative|truncate)/.test(s)
  );
};

const exempt = (sourceFile, node) => {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const lines = sourceFile.text.split("\n");
  return [lines[line], lines[line - 1]].some((l) => l !== undefined && l.includes("i18n-exempt"));
};

const inJsxExpression = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxExpression(p)) return true;
    if (ts.isJsxAttribute(p) || ts.isCallExpression(p) || ts.isBlock(p) || ts.isPropertyAssignment(p)) return false;
  }
  return false;
};

/** Literal texts of one file: `[{ line, text }]`. */
const scanFile = (absolute) => {
  const text = fs.readFileSync(absolute, "utf8");
  const tsx = absolute.endsWith(".tsx");
  const sf = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true, tsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];
  const add = (node, value) => {
    if (!looksLikeText(value) || exempt(sf, node)) return;
    found.push({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text: value.replace(/\s+/g, " ").trim() });
  };
  const isString = (n) => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      add(node, node.text);
    } else if (ts.isJsxAttribute(node) && node.initializer && TEXT_ATTRIBUTES.has(node.name.getText(sf))) {
      const init = node.initializer;
      if (ts.isStringLiteral(init)) add(init, init.text);
      else if (ts.isJsxExpression(init) && isString(init.expression)) add(init.expression, init.expression.text);
    } else if (
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      TEXT_ATTRIBUTES.has(node.name.text) &&
      isString(node.initializer)
    ) {
      add(node.initializer, node.initializer.text);
    } else if (isString(node) && inJsxExpression(node) && !ts.isJsxAttribute(node.parent)) {
      add(node, node.text);
    } else if (ts.isTemplateExpression(node) && inJsxExpression(node)) {
      const literal = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" ");
      add(node, literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
};

const sourceFiles = () => {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "__tests__") walk(full);
      } else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec|stories)\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
        out.push(full);
      }
    }
  };
  for (const dir of SCANNED) if (fs.existsSync(path.join(ROOT, dir))) walk(path.join(ROOT, dir));
  return out;
};

/** `{ "components/…/X.tsx": count }` for every file that still has literal text, sorted by path. */
const countLiterals = () => {
  const counts = {};
  for (const file of sourceFiles()) {
    const n = scanFile(file).length;
    if (n > 0) counts[path.relative(ROOT, file).split(path.sep).join("/")] = n;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
};

const BASELINE = path.join(__dirname, "baseline.json");

module.exports = { ROOT, BASELINE, scanFile, countLiterals, looksLikeText };

if (require.main === module) {
  const counts = countLiterals();
  fs.writeFileSync(BASELINE, JSON.stringify(counts, null, 2) + "\n");
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`i18n baseline: ${total} literal texts in ${Object.keys(counts).length} files → ${path.relative(ROOT, BASELINE)}`);
}
