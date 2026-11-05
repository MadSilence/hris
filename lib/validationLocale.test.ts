import * as yup from "yup";

import { setValidationLocale } from "@/lib/validationLocale";

const errorOf = (schema: yup.AnySchema, value: unknown): string => {
  try {
    schema.validateSync(value);
    return "";
  } catch (error) {
    return (error as yup.ValidationError).message;
  }
};

describe("yup's default messages", () => {
  afterEach(() => setValidationLocale("en"));

  it("come from the catalogue, without the field's key", () => {
    expect(errorOf(yup.string().min(2), "a")).toBe("Must be at least 2 characters");
    expect(errorOf(yup.string().email(), "nope")).toBe("Must be a valid email");
    expect(errorOf(yup.string().required(), "")).toBe("This field is required");
  });

  it("follow a language chosen after the schema was built", () => {
    const schema = yup.string().max(3);
    setValidationLocale("ru");
    expect(errorOf(schema, "abcde")).toBe("Не более 3 символов");
  });

  it("leave a rule's own message alone", () => {
    expect(errorOf(yup.string().min(2, "Too short"), "a")).toBe("Too short");
  });
});
