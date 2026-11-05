/**
 * The pseudo-locale's transform (`I18N_DESIGN.md` § 7.4): `Save` → `[Šàvé ~~]`.
 *
 * Every letter outside an ICU argument is swapped for an accented twin and the message is padded by about a
 * third, so a string that was never extracted stands out as plain English and a layout that only fits English
 * breaks in the walk instead of in Russian. ICU syntax — `{name}`, `{count, plural, one {…} other {…}}`,
 * `<b>…</b>` tags — is kept intact: only literal text between them is changed.
 */
const ACCENTED: Record<string, string> = {
  a: "à", b: "ƀ", c: "ç", d: "ð", e: "é", f: "ƒ", g: "ĝ", h: "ĥ", i: "î", j: "ĵ", k: "ķ", l: "ļ", m: "ɱ",
  n: "ñ", o: "ö", p: "þ", q: "ǫ", r: "ŕ", s: "š", t: "ţ", u: "û", v: "ṽ", w: "ŵ", x: "ẋ", y: "ý", z: "ž",
  A: "À", B: "Ɓ", C: "Ç", D: "Ð", E: "É", F: "Ƒ", G: "Ĝ", H: "Ĥ", I: "Î", J: "Ĵ", K: "Ķ", L: "Ļ", M: "Ṁ",
  N: "Ñ", O: "Ö", P: "Þ", Q: "Ǫ", R: "Ŕ", S: "Š", T: "Ţ", U: "Û", V: "Ṽ", W: "Ŵ", X: "Ẋ", Y: "Ý", Z: "Ž",
};

const accent = (text: string): string => text.replace(/[A-Za-z]/g, (ch) => ACCENTED[ch] ?? ch);

/**
 * Accents the literal text of one ICU message. Walks the braces: depth 0 is literal text; inside an argument
 * the first two comma-separated parts (`name, plural`) are syntax, and nested `{…}` blocks are messages again.
 */
export const pseudoMessage = (message: string): string => {
  let out = "";
  let i = 0;
  // The padding follows the text a reader sees, not the ICU syntax around it: a `select` over three greetings
  // padded by its whole source drew a tail wider than the screen (the i18n walk of 2026-11-05).
  let longestLiteral = 0;
  let literalRun = 0;

  const literal = (stopAtClose: boolean): void => {
    let buffer = "";
    const flush = () => {
      out += accent(buffer);
      literalRun += buffer.length;
      buffer = "";
    };
    while (i < message.length) {
      const ch = message[i];
      if (ch === "'" && message[i + 1] === "'") {
        buffer += "''";
        i += 2;
      } else if (ch === "<") {
        // A rich-text tag (`<b>`, `</link>`) is syntax.
        flush();
        const end = message.indexOf(">", i);
        const stop = end === -1 ? message.length : end + 1;
        out += message.slice(i, stop);
        i = stop;
      } else if (ch === "{") {
        flush();
        argument();
      } else if (ch === "}" && stopAtClose) {
        flush();
        return;
      } else {
        buffer += ch;
        i++;
      }
    }
    flush();
  };

  const argument = (): void => {
    // At "{". Copy the argument's name and type verbatim; then each `{…}` sub-message is literal text again.
    // Each branch is one alternative, so the visible length is the longest branch, not their sum.
    const runBefore = literalRun;
    let longestBranch = 0;
    out += "{";
    i++;
    while (i < message.length && message[i] !== "}" && message[i] !== "{") {
      out += message[i];
      i++;
    }
    while (i < message.length && message[i] === "{") {
      out += "{";
      i++;
      literalRun = 0;
      literal(true);
      longestBranch = Math.max(longestBranch, literalRun);
      out += "}";
      i++;
      // Selector keywords between sub-messages (`one`, `=0`, `other`) are syntax.
      while (i < message.length && message[i] !== "{" && message[i] !== "}") {
        out += message[i];
        i++;
      }
    }
    if (message[i] === "}") {
      out += "}";
      i++;
    }
    literalRun = runBefore + longestBranch;
  };

  literal(false);
  longestLiteral = Math.max(longestLiteral, literalRun);
  const padding = "~".repeat(Math.max(2, Math.round(longestLiteral * 0.35)));
  return `[${out} ${padding}]`;
};

/** The whole catalogue through {@link pseudoMessage}, keeping its shape. */
export const pseudoCatalogue = <T>(messages: T): T => {
  if (typeof messages === "string") return pseudoMessage(messages) as T;
  if (messages && typeof messages === "object") {
    return Object.fromEntries(
      Object.entries(messages as Record<string, unknown>).map(([key, value]) => [key, pseudoCatalogue(value)]),
    ) as T;
  }
  return messages;
};
