import { mentionAt, placeholdersFor, templateDraft } from "./draft";

describe("the builder's draft helpers", () => {
  it("finds the @ the caret sits after, and nothing inside a placeholder or an address", () => {
    expect(mentionAt("Hello @fir", 10)).toEqual({ start: 6, query: "fir" });
    expect(mentionAt("@", 1)).toEqual({ start: 0, query: "" });
    expect(mentionAt("mail anna@example", 17)).toBeNull();
    expect(mentionAt("Hello {firstName}", 17)).toBeNull();
  });

  it("offers an event's placeholders only under that event", () => {
    const catalog = { placeholders: ["firstName"], events: [{ value: "TIME_OFF_APPROVED", placeholders: ["leaveStart"] }] };
    expect(placeholdersFor(catalog, { type: "EVENT", event: "TIME_OFF_APPROVED" })).toEqual(["firstName", "leaveStart"]);
    expect(placeholdersFor(catalog, { type: "PERSON_HIRED" })).toEqual(["firstName"]);
  });

  it("turns a template into a draft with an audience even when it has none", () => {
    const d = templateDraft({ name: "Birthday", description: "Yearly.", definition: { trigger: { type: "PERSON_HIRED" }, actions: [] } as never });
    expect(d.name).toBe("Birthday");
    expect(d.definition.conditions.filters).toEqual([]);
    expect(d.definition.latePolicy).toBe("RUN_LATE");
  });
});
