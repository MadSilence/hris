import {
  companyHost,
  companyOrigin,
  normalizeCompanyAddress,
  parseHost,
  requestHost,
  rootOrigin,
} from "@/lib/companyAddress";

const local = { scheme: "http", rootDomain: "localhost:3000" };

describe("normalizeCompanyAddress", () => {
  /*
    This table has a twin: `SubdomainServiceTest` in hris-api. Registration gives out addresses by the
    backend's rule; step 1 sends the browser to the address this rule shows. Change a row here and
    change it there.
  */
  it.each([
    ["acme", "acme"],
    ["Acme", "acme"],
    ["  Acme Corp  ", "acme-corp"],
    ["Acme   Corp", "acme-corp"],
    ["acme.corp", "acme-corp"],
    ["acme--corp", "acme-corp"],
    ["-acme-", "acme"],
    ["Acme & Sons, Ltd.", "acme-sons-ltd"],
    ["ACME_42", "acme-42"],
    ["Café", "caf"],
    ["---", ""],
    ["acme.localhost:3000", "acme-localhost-3000"],
  ])("%j -> %j", (typed, address) => {
    expect(normalizeCompanyAddress(typed)).toBe(address);
  });

  it("cuts an address to what a host can carry, never ending on a dash", () => {
    const address = normalizeCompanyAddress(`${"a".repeat(62)} b${"c".repeat(10)}`);

    expect(address).toHaveLength(62);
    expect(address.endsWith("-")).toBe(false);
  });
});

describe("parseHost", () => {
  it("reads a company from its own host", () => {
    expect(parseHost("acme.localhost:3000", "localhost:3000")).toEqual({ kind: "company", subdomain: "acme" });
    expect(parseHost("Local-Sandbox.LOCALHOST:3000", "localhost:3000")).toEqual({
      kind: "company",
      subdomain: "local-sandbox",
    });
  });

  it.each([
    ["the root itself", "localhost:3000"],
    ["www", "www.localhost:3000"],
    ["another port", "acme.localhost:3001"],
    ["an IP address", "192.168.1.15:3000"],
    ["a deeper subdomain", "a.b.localhost:3000"],
    ["a label no company can hold", "acme_.localhost:3000"],
    ["nothing", null],
  ])("reads %s as the root", (_, host) => {
    expect(parseHost(host, "localhost:3000")).toEqual({ kind: "root" });
  });
});

describe("addresses", () => {
  it("builds the root and a company's origin", () => {
    expect(rootOrigin(local)).toBe("http://localhost:3000");
    expect(companyOrigin("acme", local)).toBe("http://acme.localhost:3000");
    expect(companyHost("acme", local)).toBe("acme.localhost:3000");
  });

  it("prefers the forwarded host, which is what the browser asked for behind a proxy", () => {
    const headers = new Map([
      ["host", "10.0.0.5:3000"],
      ["x-forwarded-host", "acme.example.co, proxy.internal"],
    ]);

    expect(requestHost({ get: (name) => headers.get(name) ?? null })).toBe("acme.example.co");
  });
});
