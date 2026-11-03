import { insertMention, mentionOptions, mentionQueryAt, replaceMentions, splitMentions } from "./mentions";

const values = { subject: "Ann", subjectFullName: "Ann Lee", manager: "Bea", cycle: "H2 Review" };

describe("mentions", () => {
  it("replaces every token, the longest name first", () => {
    expect(replaceMentions("Did @subjectFullName (@subject) help @manager in @cycle?", values))
      .toBe("Did Ann Lee (Ann) help Bea in H2 Review?");
  });

  it("reads the old brace form as @subject", () => {
    expect(replaceMentions("How did {subjectFirstName} do?", values)).toBe("How did Ann do?");
  });

  it("leaves an unknown @word, an e-mail address and a token glued to more letters alone", () => {
    expect(replaceMentions("Ask @team or hr@subject.com about @subjects", values))
      .toBe("Ask @team or hr@subject.com about @subjects");
  });

  it("says who is meant when a name is missing", () => {
    expect(replaceMentions("Talk to @manager", { subject: "Ann" })).toBe("Talk to their manager");
  });

  it("cuts the text into runs and tokens for highlighting", () => {
    expect(splitMentions("Hi @subject, {subjectFirstName}!")).toEqual([
      { text: "Hi ", token: null },
      { text: "@subject", token: "subject" },
      { text: ", ", token: null },
      { text: "{subjectFirstName}", token: "subject" },
      { text: "!", token: null },
    ]);
  });

  it("finds the @word being typed and the tokens it can become", () => {
    expect(mentionQueryAt("How did @sub", 12)).toEqual({ start: 8, query: "sub" });
    expect(mentionQueryAt("mail hr@sub", 11)).toBeNull();
    expect(mentionQueryAt("@", 1)).toEqual({ start: 0, query: "" });
    expect(mentionOptions("sub").map((o) => o.token)).toEqual(["subject", "subjectFullName"]);
    expect(mentionOptions("x")).toEqual([]);
  });

  it("inserts a whole token with a space after it", () => {
    expect(insertMention("How did @su do?", 8, 2, "subject")).toEqual({ text: "How did @subject do?", caret: 16 });
    expect(insertMention("Ask @", 4, 0, "manager")).toEqual({ text: "Ask @manager ", caret: 13 });
  });
});
