import { createTranslator } from "use-intl/core";

import { negotiateLanguage, toLanguage } from "./locales";
import { messagesFor } from "./messages";
import { pseudoMessage } from "./pseudo";

describe("toLanguage", () => {
  it("reads a stored code loosely and refuses what we do not speak", () => {
    expect(toLanguage(" RU ")).toBe("ru");
    expect(toLanguage("en")).toBe("en");
    expect(toLanguage("de")).toBeNull();
    expect(toLanguage(null)).toBeNull();
  });
});

describe("negotiateLanguage", () => {
  it("takes the best-ranked language we have, ignoring regions", () => {
    expect(negotiateLanguage("de-DE,de;q=0.9,ru-RU;q=0.8,en;q=0.7")).toBe("ru");
    expect(negotiateLanguage("en-GB,en;q=0.9")).toBe("en");
    expect(negotiateLanguage("ru;q=0.5,en;q=0.9")).toBe("en");
  });

  it("answers nothing for a header without our languages, or none at all", () => {
    expect(negotiateLanguage("de,fr;q=0.5")).toBeNull();
    expect(negotiateLanguage(null)).toBeNull();
    expect(negotiateLanguage("ru;q=0")).toBeNull();
  });
});

describe("messagesFor", () => {
  it("reads a key Russian lacks in English, never as its raw name", () => {
    const ru = messagesFor("ru") as unknown as { common: { actions: Record<string, string> } };
    expect(ru.common.actions.save).toBe("Сохранить");
    // Every English key is present in the Russian catalogue the page receives.
    const en = messagesFor("en") as unknown as { common: { actions: Record<string, string> } };
    expect(Object.keys(ru.common.actions)).toEqual(expect.arrayContaining(Object.keys(en.common.actions)));
  });

  it("formats Russian plurals with all their forms", () => {
    const t = createTranslator({ locale: "ru", messages: messagesFor("ru"), namespace: "common" });
    expect([1, 2, 5, 21].map((count) => t("time.days", { count }))).toEqual(["1 день", "2 дня", "5 дней", "21 день"]);
  });
});

describe("pseudoMessage", () => {
  it("accents literal text and pads it, keeping ICU syntax intact", () => {
    const out = pseudoMessage("Remove {name}");
    expect(out).toMatch(/^\[Ŕéɱöṽé \{name\} ~+\]$/);
  });

  it("keeps plural selectors, # and tags, and accents the sub-messages", () => {
    const out = pseudoMessage("{count, plural, one {# day} other {# days}} <b>left</b>");
    expect(out).toContain("{count, plural, one {# ðàý} other {# ðàýš}}");
    expect(out).toContain("<b>ļéƒţ</b>");
  });

  it("pads by the longest visible branch, not by the ICU source", () => {
    const out = pseudoMessage("{part, select, morning {Good morning} afternoon {Good afternoon} other {Good evening}}");
    // "Good afternoon" is 14 characters → 5 tildes; the whole source (~90) would have given ~32.
    expect(out.match(/~+\]$/)?.[0]).toBe("~~~~~]");
  });

  it("produces messages the formatter still accepts", () => {
    const t = createTranslator({ locale: "en-XA", messages: messagesFor("en-XA"), namespace: "common" });
    expect(t("time.days", { count: 3 })).toContain("3 ðàýš");
  });
});
