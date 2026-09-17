import { buildFieldAccessBody } from "./fieldAccessDraft";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";
import { partialMock } from "@/test/types";

const field = (id: string, configurable = true): FieldDTO =>
  partialMock<FieldDTO>({ id, key: id, label: id, type: AttributeType.TEXT, configurable });

describe("buildFieldAccessBody", () => {
  it("sends the rows together with the version the matrix was loaded with", () => {
    const body = buildFieldAccessBody(
      { "sys:first_name": { SELF: "EDIT", DIRECT_REPORTS: "VIEW", COMPANY: "NONE" } },
      [field("sys:first_name"), field("sys:locked", false)],
      3,
    );

    // Exact: this is the whole PUT body, and the backend refuses a property it does not declare.
    expect(body).toStrictEqual({
      fields: [
        { fieldId: "sys:first_name", viewScopes: ["DIRECT_REPORTS"], editScopes: ["SELF"], manageScopes: [] },
      ],
      version: 3,
    });
  });
});
