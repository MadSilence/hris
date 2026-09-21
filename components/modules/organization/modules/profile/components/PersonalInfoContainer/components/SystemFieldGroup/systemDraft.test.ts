import type { User } from "@/models/user/User";
import { NONE_VALUE } from "@/models/select";
import { partialMock } from "@/test/types";

import { changedSystemFields, systemDraftOf, systemPatchOf } from "./systemDraft";

const EDIT_ALL: Record<string, "EDIT" | "VIEW" | "MASKED"> = {
  "sys:first_name": "EDIT",
  "sys:last_name": "EDIT",
  "sys:email": "EDIT",
  "sys:manager": "EDIT",
  "sys:job": "EDIT",
  "sys:office": "EDIT",
  "sys:legal_entity": "EDIT",
};

const person = (over: Partial<User> = {}): User =>
  partialMock<User>({
    id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    jobId: "job-1",
    office: { id: "office-1", name: "Berlin" },
    manager: { id: "m-1", name: "Charles" },
    fieldAccess: EDIT_ALL,
    ...over,
  } as Partial<User>);

describe("systemDraft", () => {
  it("reports nothing for an untouched draft", () => {
    const user = person();
    expect(changedSystemFields(user, systemDraftOf(user))).toEqual([]);
    expect(systemPatchOf(user, systemDraftOf(user))).toEqual({});
    expect(systemPatchOf(user, null)).toEqual({});
  });

  it("sends only what changed, with references as ids and a cleared one as null", () => {
    const user = person();
    const draft = { ...systemDraftOf(user), firstName: "Augusta", officeId: NONE_VALUE, jobId: "job-2" };

    expect(changedSystemFields(user, draft).sort()).toEqual(["sys:first_name", "sys:job", "sys:office"]);
    expect(systemPatchOf(user, draft)).toEqual({ firstName: "Augusta", officeId: null, jobId: "job-2" });
  });

  it("never sends a field the caller may not write — the server would refuse the whole save", () => {
    const user = person({ fieldAccess: { ...EDIT_ALL, "sys:email": "VIEW" } });
    const draft = { ...systemDraftOf(user), email: "new@example.com", lastName: "King" };

    expect(changedSystemFields(user, draft)).toEqual(["sys:last_name"]);
    expect(systemPatchOf(user, draft)).toEqual({ lastName: "King" });
  });

  it("sends a cleared manager as null", () => {
    const user = person();
    expect(systemPatchOf(user, { ...systemDraftOf(user), manager: null })).toEqual({ managerId: null });
  });
});
