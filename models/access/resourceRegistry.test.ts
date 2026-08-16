import { readFileSync } from "fs";
import { join } from "path";
import { RESOURCE_GROUPS } from "./resourceRegistry";

/**
 * The backend owns which resources exist; this catalogue owns their labels. When the two lists
 * drift, the permissions matrix silently stops showing whatever the backend added — and until the
 * payload builder was fixed, saving a role then wiped those grants (that is how the Default User
 * role lost its NOTIFICATION.* rights).
 *
 * Reading the Java source is crude, but it fails at the moment the drift is introduced instead of
 * in production three weeks later.
 */
const REGISTRY_JAVA = join(
  __dirname,
  "../../../hris-api/src/main/java/com/example/security/access/ResourceRegistry.java",
);

function backendResourceCodes(): string[] {
  const source = readFileSync(REGISTRY_JAVA, "utf8");
  return [...source.matchAll(/new ResourceDefinition\("([A-Z._]+)"/g)]
    .map((match) => match[1])
    .sort();
}

describe("resource catalogue", () => {
  it("lists exactly the resources the backend registry defines", () => {
    const frontend = RESOURCE_GROUPS.flatMap((group) => group.resources)
      .map((resource) => resource.code)
      .sort();

    expect(frontend).toEqual(backendResourceCodes());
  });

  it("has no duplicate codes across groups", () => {
    const codes = RESOURCE_GROUPS.flatMap((group) => group.resources).map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every resource at least one action and one scope", () => {
    for (const resource of RESOURCE_GROUPS.flatMap((group) => group.resources)) {
      expect(resource.supportedActions.length).toBeGreaterThan(0);
      expect(resource.supportedScopes.length).toBeGreaterThan(0);
    }
  });
});
