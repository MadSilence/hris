import type { useTranslations } from "next-intl";
import { translatorFor } from "@/test/nextIntl";
import { formatUserStatus } from "./status";

const tCommon = translatorFor("common") as unknown as ReturnType<typeof useTranslations<"common">>;

describe("formatUserStatus", () => {
  // W6: a person reads Active, Joining or Inactive everywhere; the stored codes stay PROSPECTIVE / ARCHIVED.
  it.each([
    ["PROSPECTIVE", "Joining"],
    ["ACTIVE", "Active"],
    ["ARCHIVED", "Inactive"],
    ["archived", "Inactive"],
  ])("reads %s as %s", (code, word) => {
    expect(formatUserStatus(tCommon, code)).toBe(word);
  });

  it("never says Archived or Not started", () => {
    const words = ["PROSPECTIVE", "ACTIVE", "ARCHIVED"].map((s) => formatUserStatus(tCommon, s));
    expect(words).not.toContain("Archived");
    expect(words).not.toContain("Not started");
  });
});
