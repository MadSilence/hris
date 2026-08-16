import {
  availableScopeChoices,
  buildRolePermissionsPayload,
  choiceToScopes,
  diffRolePermissions,
  draftFromPermissions,
  isMissingViewAccess,
  normalizeScopes,
  RolePermissionsDraft,
  SCOPE_CHOICES,
  scopesToChoice,
} from "./rolePermissionsPayload";

describe("normalizeScopes", () => {
  it("collapses everything to COMPANY when COMPANY is present", () => {
    expect(normalizeScopes(["SELF", "COMPANY", "DIRECT_REPORTS"])).toEqual(["COMPANY"]);
  });

  it("drops duplicates but keeps narrower scopes side by side", () => {
    expect(normalizeScopes(["SELF", "SELF", "DIRECT_REPORTS"])).toEqual(["SELF", "DIRECT_REPORTS"]);
  });
});

describe("buildRolePermissionsPayload", () => {
  it("never expands MANAGE into EDIT/VIEW", () => {
    const draft: RolePermissionsDraft = { "ORG.DEPARTMENT": { MANAGE: ["COMPANY"] } };

    expect(buildRolePermissionsPayload(draft)).toEqual([
      { resourceCode: "ORG.DEPARTMENT", action: "MANAGE", scopes: ["COMPANY"] },
    ]);
  });

  it("emits one row per explicitly granted action", () => {
    const draft: RolePermissionsDraft = {
      "ORG.DEPARTMENT": { VIEW: ["COMPANY"], EDIT: ["COMPANY"], MANAGE: ["COMPANY"] },
    };

    expect(buildRolePermissionsPayload(draft)).toEqual([
      { resourceCode: "ORG.DEPARTMENT", action: "VIEW", scopes: ["COMPANY"] },
      { resourceCode: "ORG.DEPARTMENT", action: "EDIT", scopes: ["COMPANY"] },
      { resourceCode: "ORG.DEPARTMENT", action: "MANAGE", scopes: ["COMPANY"] },
    ]);
  });

  it("skips actions with no scopes instead of sending an empty row", () => {
    const draft: RolePermissionsDraft = {
      "ORG.DEPARTMENT": { VIEW: ["COMPANY"], EDIT: [] },
    };

    expect(buildRolePermissionsPayload(draft)).toEqual([
      { resourceCode: "ORG.DEPARTMENT", action: "VIEW", scopes: ["COMPANY"] },
    ]);
  });

  it("drops actions the resource does not support", () => {
    // ORG.PUBLIC_HOLIDAY_TEMPLATE supports VIEW only.
    const draft: RolePermissionsDraft = {
      "ORG.PUBLIC_HOLIDAY_TEMPLATE": { VIEW: ["COMPANY"], EDIT: ["COMPANY"], MANAGE: ["COMPANY"] },
    };

    expect(buildRolePermissionsPayload(draft)).toEqual([
      { resourceCode: "ORG.PUBLIC_HOLIDAY_TEMPLATE", action: "VIEW", scopes: ["COMPANY"] },
    ]);
  });

  it("drops scopes the resource does not support", () => {
    // ORG.DEPARTMENT is COMPANY-only.
    const draft: RolePermissionsDraft = {
      "ORG.DEPARTMENT": { VIEW: ["SELF", "DIRECT_REPORTS"] },
    };

    expect(buildRolePermissionsPayload(draft)).toEqual([]);
  });

  it("keeps SELF and DIRECT_REPORTS together for personal-scope resources", () => {
    const draft: RolePermissionsDraft = {
      "PEOPLE.PROFILE": { VIEW: ["SELF", "DIRECT_REPORTS"] },
    };

    expect(buildRolePermissionsPayload(draft)).toEqual([
      { resourceCode: "PEOPLE.PROFILE", action: "VIEW", scopes: ["SELF", "DIRECT_REPORTS"] },
    ]);
  });

  it("never emits a duplicate resource/action pair (422 RA00004)", () => {
    const draft: RolePermissionsDraft = {
      "PEOPLE.PROFILE": { VIEW: ["SELF", "SELF", "COMPANY"] },
    };

    const payload = buildRolePermissionsPayload(draft);
    const pairs = payload.map((row) => `${row.resourceCode}:${row.action}`);

    expect(new Set(pairs).size).toBe(pairs.length);
    expect(payload).toEqual([
      { resourceCode: "PEOPLE.PROFILE", action: "VIEW", scopes: ["COMPANY"] },
    ]);
  });

  it("keeps rows for resources this build of the UI doesn't know about", () => {
    // Regression: the builder used to walk only the local catalogue, so anything the backend had
    // added since (NOTIFICATION.* was the real case) was absent from the PUT body — and the backend
    // replaces wholesale, so saving a role quietly revoked those grants.
    const draft = {
      "ROLES.ROLE": { VIEW: ["COMPANY"] },
      "FUTURE.RESOURCE": { MANAGE: ["COMPANY"] },
    } as unknown as Parameters<typeof buildRolePermissionsPayload>[0];

    const payload = buildRolePermissionsPayload(draft);

    expect(payload).toContainEqual({
      resourceCode: "FUTURE.RESOURCE",
      action: "MANAGE",
      scopes: ["COMPANY"],
    });
  });

  it("round-trips a server response through the draft unchanged", () => {
    const permissions = [
      { resourceCode: "ROLES.ROLE" as const, action: "VIEW" as const, scopes: ["COMPANY" as const] },
      { resourceCode: "ROLES.ROLE" as const, action: "EDIT" as const, scopes: ["COMPANY" as const] },
    ];

    expect(buildRolePermissionsPayload(draftFromPermissions(permissions))).toEqual(permissions);
  });
});

describe("scope choices", () => {
  it("round-trips every choice through scopes", () => {
    for (const choice of SCOPE_CHOICES) {
      expect(scopesToChoice(choiceToScopes(choice))).toBe(choice);
    }
  });

  it("offers only on/off for COMPANY-only resources", () => {
    expect(availableScopeChoices("ORG.DEPARTMENT", "VIEW")).toEqual(["NONE", "COMPANY"]);
  });

  it("offers the full ladder for personal-scope resources", () => {
    expect(availableScopeChoices("PEOPLE.PROFILE", "VIEW")).toEqual([
      "NONE",
      "SELF",
      "DIRECT_REPORTS",
      "SELF_AND_REPORTS",
      "MY_TEAM",
      "MY_TEAM_SUBTREE",
      "MY_DEPARTMENT",
      "MY_DEPARTMENT_SUBTREE",
      "MY_OFFICE",
      "MY_LEGAL_ENTITY",
      "COMPANY",
      "CUSTOM",
    ]);
  });

  // The actor-derived scopes are single values, unlike the SELF/DIRECT_REPORTS pair.
  it("maps an actor-derived choice to exactly its own scope", () => {
    expect(choiceToScopes("MY_DEPARTMENT_SUBTREE")).toEqual(["MY_DEPARTMENT_SUBTREE"]);
    expect(scopesToChoice(["MY_OFFICE"])).toBe("MY_OFFICE");
  });

  it("still lets COMPANY absorb everything narrower", () => {
    expect(scopesToChoice(["MY_DEPARTMENT", "COMPANY"])).toBe("COMPANY");
  });
});

describe("diffRolePermissions", () => {
  it("returns nothing when drafts are equal", () => {
    const draft: RolePermissionsDraft = { "ORG.DEPARTMENT": { VIEW: ["COMPANY"] } };
    expect(diffRolePermissions(draft, draft)).toEqual([]);
  });

  it("reports a granted, changed and revoked scope with readable choices", () => {
    const before: RolePermissionsDraft = {
      "ORG.DEPARTMENT": { VIEW: ["COMPANY"], EDIT: ["COMPANY"] },
      "PEOPLE.PROFILE": { VIEW: ["SELF"] },
    };
    const after: RolePermissionsDraft = {
      "ORG.DEPARTMENT": { VIEW: ["COMPANY"] }, // EDIT revoked
      "PEOPLE.PROFILE": { VIEW: ["COMPANY"] }, // scope widened
      "ORG.TEAM": { MANAGE: ["COMPANY"] }, // newly granted
    };

    const changes = diffRolePermissions(before, after);

    expect(changes).toEqual([
      { resourceCode: "PEOPLE.PROFILE", resourceLabel: "Profiles", action: "VIEW", from: "SELF", to: "COMPANY" },
      { resourceCode: "ORG.DEPARTMENT", resourceLabel: "Departments", action: "EDIT", from: "COMPANY", to: "NONE" },
      { resourceCode: "ORG.TEAM", resourceLabel: "Teams", action: "MANAGE", from: "NONE", to: "COMPANY" },
    ]);
  });
});

describe("isMissingViewAccess", () => {
  it("flags EDIT or MANAGE granted without VIEW", () => {
    expect(isMissingViewAccess("ORG.DEPARTMENT", { MANAGE: ["COMPANY"] })).toBe(true);
    expect(isMissingViewAccess("ORG.DEPARTMENT", { EDIT: ["COMPANY"] })).toBe(true);
  });

  it("stays quiet when VIEW is granted too", () => {
    expect(isMissingViewAccess("ORG.DEPARTMENT", { VIEW: ["COMPANY"], MANAGE: ["COMPANY"] })).toBe(false);
  });

  it("stays quiet for resources that have no VIEW action at all", () => {
    // SETTINGS.IMPERSONATION supports MANAGE only.
    expect(isMissingViewAccess("SETTINGS.IMPERSONATION", { MANAGE: ["COMPANY"] })).toBe(false);
  });
});
