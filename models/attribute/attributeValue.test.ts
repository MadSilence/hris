import {
  optionValueId,
  optionValueLabel,
  parseCheckboxValue,
  parseOptionValue,
} from "@/models/attribute/attributeValue";

/**
 * A SELECT value is `{ id, label }` and **the id is the identity** — see `DECISIONS.md` § "A SELECT
 * value travels as {id, label}". These cases are the boundary the rest of the frontend relies on:
 * it reads the label and sends the id, and nothing anywhere resolves an option by its text.
 */
describe("option values", () => {
  it("reads the label and sends the id", () => {
    const value = { id: "opt:9c21", label: "Contractor" };

    expect(optionValueLabel(value)).toBe("Contractor");
    expect(optionValueId(value)).toBe("opt:9c21");
  });

  it("keeps a masked option readable and unmatchable", () => {
    // The shape survives redaction so no consumer needs a second branch for it.
    const masked = { id: null, label: "••••" };

    expect(parseOptionValue(masked)).toEqual({ id: null, label: "••••" });
    expect(optionValueLabel(masked)).toBe("••••");
    expect(optionValueId(masked)).toBeNull();
  });

  it("shows an option with no label as itself rather than as nothing", () => {
    // An option deleted after the value was written must not make the value disappear silently.
    expect(optionValueLabel({ id: "opt:9c21", label: null })).toBe("opt:9c21");
  });

  it("is not fooled by the shapes that are not option values", () => {
    expect(parseOptionValue("Contractor")).toBeNull();
    expect(parseOptionValue(null)).toBeNull();
    expect(parseOptionValue([{ id: "opt:1", label: "A" }])).toBeNull();
    // A person value has a name, not a label, and must not be read as an option.
    expect(parseOptionValue({ id: "u1", name: "Anna" })).toBeNull();
  });

  it("still parses a checkbox stored as text", () => {
    // The reason this module exists: values arrive as strings, and "false" is truthy.
    expect(parseCheckboxValue("false")).toBe(false);
    expect(parseCheckboxValue("true")).toBe(true);
  });
});
