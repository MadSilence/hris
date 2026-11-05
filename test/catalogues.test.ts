/**
 * The catalogues' own checks (I18N_DESIGN.md § 7.3). What `tsc` cannot see in JSON:
 *
 * - every message parses as ICU — a stray `{` or an unclosed plural breaks a page at render, not at build;
 * - a translation names the same arguments as English — a Russian sentence that forgot `{name}` drops the
 *   name, one that invented `{count}` prints the raw braces;
 * - a translation has no key English lacks — a key renamed in English and kept in Russian is dead text;
 * - English has no empty message.
 *
 * What a translation **lacks** is reported, not failed: it is read in English until somebody translates it.
 */
import { parse, TYPE, type MessageFormatElement } from "@formatjs/icu-messageformat-parser";

import en from "@/messages/en";
import ru from "@/messages/ru";

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ""): Map<string, string> => {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else for (const [k, v] of flatten(value, path)) out.set(k, v);
  }
  return out;
};

const argumentsOf = (elements: MessageFormatElement[], into = new Set<string>()): Set<string> => {
  for (const element of elements) {
    if (element.type === TYPE.literal || element.type === TYPE.pound) continue;
    if ("value" in element && typeof element.value === "string" && element.type !== TYPE.tag) into.add(element.value);
    if (element.type === TYPE.tag) {
      into.add(`<${element.value}>`);
      argumentsOf(element.children, into);
    }
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      for (const option of Object.values(element.options)) argumentsOf(option.value, into);
    }
  }
  return into;
};

const english = flatten(en as unknown as Tree);
const catalogues: Record<string, Map<string, string>> = { ru: flatten(ru as unknown as Tree) };

describe("the message catalogues", () => {
  it("English has messages, none of them empty", () => {
    expect(english.size).toBeGreaterThan(0);
    expect([...english].filter(([, message]) => message.trim() === "").map(([key]) => key)).toEqual([]);
  });

  it("every message parses as ICU", () => {
    const broken: string[] = [];
    for (const [locale, messages] of Object.entries({ en: english, ...catalogues })) {
      for (const [key, message] of messages) {
        try {
          parse(message);
        } catch (error) {
          broken.push(`${locale} ${key}: ${(error as Error).message}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it.each(Object.keys(catalogues))("%s has no key English lacks", (locale) => {
    expect([...catalogues[locale].keys()].filter((key) => !english.has(key))).toEqual([]);
  });

  it.each(Object.keys(catalogues))("%s names the same arguments as English, key by key", (locale) => {
    const mismatched: string[] = [];
    for (const [key, message] of catalogues[locale]) {
      const source = english.get(key);
      if (source === undefined) continue;
      const want = [...argumentsOf(parse(source))].sort().join(",");
      const have = [...argumentsOf(parse(message))].sort().join(",");
      if (want !== have) mismatched.push(`${key}: en {${want}} ≠ ${locale} {${have}}`);
    }
    expect(mismatched).toEqual([]);
  });

  it.each(Object.keys(catalogues))("reports what %s has not translated yet", (locale) => {
    const missing = [...english.keys()].filter((key) => !catalogues[locale].has(key));
    if (missing.length > 0) {
      // A report, not a failure: the key is read in English meanwhile (i18n/messages.ts).
      console.info(`${locale}: ${missing.length} of ${english.size} keys untranslated, e.g. ${missing.slice(0, 5).join(", ")}`);
    }
    expect(missing.length).toBeLessThanOrEqual(english.size);
  });
});
